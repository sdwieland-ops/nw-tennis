import { supabase } from './supabaseClient'

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

// Server-side checks platform_admins itself (see migration 023) — a 403
// here just means "not an admin", handled by the caller like any other
// error, not a special case.
export async function getDashboardData() {
  return callFunction('admin-dashboard-data', {})
}

export async function updatePrice(priceId, amount) {
  const { error } = await supabase.from('billing_prices').update({ amount }).eq('id', priceId)
  if (error) throw error
}

export async function createCoupon({ code, percentOff, amountOff, currency, maxRedemptions }) {
  return callFunction('admin-create-coupon', { code, percentOff, amountOff, currency, maxRedemptions })
}
