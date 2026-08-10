// Creates a Stripe Coupon + a human-typable Promotion Code on top of it.
// Deliberately doesn't build any custom discount logic — the code is
// redeemed via Stripe's own "promo code" field, shown automatically in
// Checkout once allow_promotion_codes is on (see create-checkout-session),
// so validation/expiry/redemption-limits are all Stripe's problem, not ours.
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
    const { code, percentOff, amountOff, currency, maxRedemptions } = await req.json()

    if (!code || (!percentOff && !amountOff)) {
      return json({ error: 'code und entweder percentOff oder amountOff sind erforderlich.' }, 400)
    }
    if (amountOff && !currency) {
      return json({ error: 'currency ist bei amountOff erforderlich.' }, 400)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Nicht authentifiziert.' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const asCaller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    const { data: userData } = await asCaller.auth.getUser(jwt)
    if (!userData.user?.email) return json({ error: 'Nicht authentifiziert.' }, 401)

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const { data: adminRow } = await admin
      .from('platform_admins')
      .select('email')
      .eq('email', userData.user.email)
      .maybeSingle()
    if (!adminRow) return json({ error: 'Kein Zugriff.' }, 403)

    const coupon = await stripe.coupons.create({
      percent_off: percentOff || undefined,
      amount_off: amountOff || undefined,
      currency: amountOff ? currency : undefined,
      duration: 'once',
    })

    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      max_redemptions: maxRedemptions || undefined,
    })

    return json({
      id: promotionCode.id,
      code: promotionCode.code,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      currency: coupon.currency,
    })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
