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
