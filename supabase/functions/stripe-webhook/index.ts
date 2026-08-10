// The single writer of org_subscriptions. Stripe calls this directly (not
// the browser), so there's no user JWT to check — trust instead comes from
// verifying Stripe's webhook signature against STRIPE_WEBHOOK_SECRET, set
// once this function's URL is registered as a webhook endpoint in the
// Stripe dashboard. Runs with service_role since it's the one place
// intentionally allowed to write subscription status.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// Stripe's own statuses map mostly 1:1 onto ours; anything unexpected
// (unpaid, paused, incomplete_expired, ...) falls back to 'canceled' —
// losing access is the safe default, silently keeping it is not.
const STATUS_MAP: Record<string, string> = {
  trialing: 'trialing',
  active: 'active',
  past_due: 'past_due',
  canceled: 'canceled',
  incomplete: 'incomplete',
}

const GRACE_DAYS = 5

async function resolvePlanAndCurrency(stripePriceId: string | undefined) {
  if (!stripePriceId) return { plan: null, currency: null }
  const { data } = await admin
    .from('billing_prices')
    .select('plan, currency')
    .eq('stripe_price_id', stripePriceId)
    .maybeSingle()
  return { plan: data?.plan ?? null, currency: data?.currency ?? null }
}

async function upsertFromSubscription(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.org_id
  if (!orgId) {
    console.error('Stripe subscription without org_id metadata:', subscription.id)
    return
  }

  const status = STATUS_MAP[subscription.status] ?? 'canceled'
  const priceId = subscription.items.data[0]?.price?.id
  const { plan, currency } = await resolvePlanAndCurrency(priceId)

  await admin
    .from('org_subscriptions')
    .update({
      status,
      plan,
      currency,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      grace_until: status === 'past_due' ? new Date(Date.now() + GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', orgId)
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await upsertFromSubscription(subscription)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertFromSubscription(event.data.object as Stripe.Subscription)
        break
      }
      default:
        // Ignore everything else — we only need enough events to keep
        // org_subscriptions accurate, not a full audit log.
        break
    }
  } catch (err) {
    console.error('Webhook handling failed:', err instanceof Error ? err.message : err)
    // Still 200 — Stripe retries on non-2xx, which would just repeat a
    // deterministic failure. Logged above for manual follow-up instead.
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
