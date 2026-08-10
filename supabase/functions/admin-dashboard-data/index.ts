// Cross-team data for the internal /intern area — every other function in
// this app scopes reads to a single org's membership; this deliberately
// doesn't, so the admin check here is the only thing standing between a
// caller and every team's data. Runs with service_role for exactly that
// reason, same as the other admin-* functions.
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

    const [{ data: teams }, { data: activeMemberships }, { data: subs }, { data: prices }] = await Promise.all([
      admin.from('organizations').select('id, name, approved').order('name'),
      admin.from('memberships').select('user_id, role').eq('status', 'active'),
      admin.from('org_subscriptions').select('extra_seats'),
      admin.from('billing_prices').select('id, plan, currency, amount, stripe_price_id, active').order('plan').order('currency'),
    ])

    const totalUsers = new Set((activeMemberships || []).map((m) => m.user_id)).size
    const trainerCount = (activeMemberships || []).filter((m) => m.role === 'trainer').length
    const trainerExtraSeatsBooked = (subs || []).reduce((sum, s) => sum + (s.extra_seats || 0), 0)

    let promotionCodes: unknown[] = []
    try {
      const list = await stripe.promotionCodes.list({ limit: 50 })
      promotionCodes = list.data.map((pc) => ({
        id: pc.id,
        code: pc.code,
        active: pc.active,
        percentOff: typeof pc.coupon.percent_off === 'number' ? pc.coupon.percent_off : null,
        amountOff: typeof pc.coupon.amount_off === 'number' ? pc.coupon.amount_off : null,
        currency: pc.coupon.currency,
        timesRedeemed: pc.times_redeemed,
        maxRedemptions: pc.max_redemptions,
      }))
    } catch (err) {
      // Stripe reachability shouldn't take down the whole dashboard — the
      // rest of the stats are still useful without it.
      console.error('Failed to list Stripe promotion codes:', err instanceof Error ? err.message : err)
    }

    return json({
      teams: teams || [],
      teamCount: (teams || []).length,
      totalUsers,
      trainerCount,
      trainerExtraSeatsBooked,
      prices: prices || [],
      promotionCodes,
    })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
