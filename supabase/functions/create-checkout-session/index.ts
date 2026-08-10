// Starts a Stripe Checkout session for a team to subscribe to a plan.
// Runs with the service_role key because looking up the real Stripe price ID
// server-side (never trusting a client-supplied one) and reading/writing
// org_subscriptions both need elevated privileges the anon key doesn't have.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orgId, plan, currency, successUrl, cancelUrl } = await req.json()

    if (!orgId || !plan || !currency || !successUrl || !cancelUrl) {
      return json({ error: 'orgId, plan, currency, successUrl und cancelUrl sind erforderlich.' }, 400)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Nicht authentifiziert.' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Scoped to the caller's own JWT, same rationale as invite-member: RLS
    // tells us the truth about their membership/role instead of trusting
    // whatever the client claims.
    const asCaller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    const { data: userData } = await asCaller.auth.getUser(jwt)
    if (!userData.user) return json({ error: 'Nicht authentifiziert.' }, 401)
    const user = userData.user

    const { data: membership } = await asCaller
      .from('memberships')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    // Matches OrgContext.jsx's isAdmin rule — billing affects the whole
    // team, so only spieler/management may start a checkout, same as who
    // can already manage the team in general.
    if (!membership || (membership.role !== 'spieler' && membership.role !== 'management')) {
      return json({ error: 'Keine Berechtigung, ein Abo für dieses Team abzuschließen.' }, 403)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // Server-side lookup — the client only ever names plan+currency, never
    // a Stripe price ID directly, so a tampered request can't buy a
    // different price than what's actually published.
    const { data: priceRow, error: priceError } = await admin
      .from('billing_prices')
      .select('stripe_price_id')
      .eq('plan', plan)
      .eq('currency', currency)
      .eq('active', true)
      .maybeSingle()

    if (priceError || !priceRow?.stripe_price_id) {
      return json({ error: 'Für diesen Plan ist aktuell keine Buchung möglich.' }, 400)
    }

    // Reuse an existing Stripe customer if this org already has one
    // (read-only here — only the webhook ever writes org_subscriptions, to
    // keep a single source of truth for that table).
    const { data: existingSub } = await admin
      .from('org_subscriptions')
      .select('stripe_customer_id')
      .eq('org_id', orgId)
      .maybeSingle()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceRow.stripe_price_id, quantity: 1 }],
      customer: existingSub?.stripe_customer_id || undefined,
      customer_email: existingSub?.stripe_customer_id ? undefined : user.email,
      client_reference_id: orgId,
      // Also on the subscription itself, not just the session — webhook
      // events for subscription updates carry the subscription object, not
      // always the originating session, so this needs to be there too.
      subscription_data: { metadata: { org_id: orgId } },
      metadata: { org_id: orgId },
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Shows Stripe's own promo-code field on the hosted checkout page —
      // redemption, expiry and limits are all handled by Stripe itself, see
      // admin-create-coupon.
      allow_promotion_codes: true,
    })

    return json({ url: session.url })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
