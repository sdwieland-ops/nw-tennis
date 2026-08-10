import { supabase } from './supabaseClient'

// Public read (RLS: "Anyone can view active prices") — /preise has no login
// wall, so this must work for anonymous visitors too.
export async function listPrices(currency) {
  const { data, error } = await supabase
    .from('billing_prices')
    .select('plan, currency, amount')
    .eq('currency', currency)
    .eq('active', true)
  if (error) throw error
  return data
}

export async function getSubscription(orgId) {
  const { data, error } = await supabase
    .from('org_subscriptions')
    .select('status, plan, currency, current_period_end, grace_until')
    .eq('org_id', orgId)
    .maybeSingle()
  if (error) throw error
  return data
}

// Same reasoning as teamApi.js's callFunction: plain fetch instead of
// functions.invoke(), which was silently not forwarding the caller's
// session token as expected.
async function callFunction(name, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('Nicht angemeldet.')

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen.')
  return data
}

// Redirects the browser to Stripe Checkout for the given plan. Always the
// real public app URL for the return legs, never window.location.origin —
// same reasoning as inviteMember in teamApi.js.
export async function startCheckout({ orgId, plan, currency }) {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const { url } = await callFunction('create-checkout-session', {
    orgId,
    plan,
    currency,
    successUrl: `${appUrl}/app/team?checkout=success`,
    cancelUrl: `${appUrl}/app/team?checkout=cancelled`,
  })
  window.location.href = url
}

// Redirects the browser to Stripe's hosted customer portal for an existing
// subscription (plan changes, payment method, cancellation).
export async function openBillingPortal(orgId) {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const { url } = await callFunction('create-portal-session', {
    orgId,
    returnUrl: `${appUrl}/app/team`,
  })
  window.location.href = url
}
