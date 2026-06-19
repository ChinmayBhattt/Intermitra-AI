-- Create user entitlements table
CREATE TABLE public.user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  active BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on entitlements
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_entitlements" ON public.user_entitlements
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Allow users to insert/update their own entitlements for demo / local client testing
CREATE POLICY "users_can_insert_own_entitlements" ON public.user_entitlements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_entitlements" ON public.user_entitlements
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.user_entitlements TO authenticated;

-- Enable RLS and setup RLS policies on Stripe runtime tables
ALTER TABLE payments.stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.stripe_customer_portal_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_create_own_stripe_checkout" ON payments.stripe_checkout_sessions
  FOR INSERT TO authenticated
  WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

CREATE POLICY "users_read_own_stripe_checkout" ON payments.stripe_checkout_sessions
  FOR SELECT TO authenticated
  USING (subject_type = 'user' AND subject_id = auth.uid()::text);

CREATE POLICY "users_create_own_stripe_portal" ON payments.stripe_customer_portal_sessions
  FOR INSERT TO authenticated
  WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

CREATE POLICY "users_read_own_stripe_portal" ON payments.stripe_customer_portal_sessions
  FOR SELECT TO authenticated
  USING (subject_type = 'user' AND subject_id = auth.uid()::text);

GRANT INSERT, SELECT ON payments.stripe_checkout_sessions TO authenticated;
GRANT INSERT, SELECT ON payments.stripe_customer_portal_sessions TO authenticated;

-- Enable RLS and setup RLS policies on Razorpay runtime tables
ALTER TABLE payments.razorpay_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.razorpay_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_create_own_razorpay_orders" ON payments.razorpay_orders
  FOR INSERT TO authenticated
  WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

CREATE POLICY "users_create_own_razorpay_subs" ON payments.razorpay_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

CREATE POLICY "users_manage_own_razorpay_subs" ON payments.razorpay_subscriptions
  FOR UPDATE TO authenticated
  USING (subject_type = 'user' AND subject_id = auth.uid()::text)
  WITH CHECK (subject_type = 'user' AND subject_id = auth.uid()::text);

GRANT INSERT, SELECT ON payments.razorpay_orders TO authenticated;
GRANT INSERT, SELECT, UPDATE ON payments.razorpay_subscriptions TO authenticated;

-- Create a unified trigger to grant access upon payment success (webhook fulfillment)
CREATE OR REPLACE FUNCTION public.grant_subscription_access_webhook()
RETURNS TRIGGER AS $$
DECLARE
  v_subject_type TEXT;
  v_subject_id TEXT;
BEGIN
  -- Stripe Webhook Handler
  IF NEW.provider = 'stripe'
     AND NEW.event_type = 'invoice.paid'
     AND NEW.processing_status = 'processed' THEN
    
    v_subject_type := COALESCE(
      NEW.payload -> 'data' -> 'object' -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_type',
      NEW.payload -> 'data' -> 'object' -> 'metadata' ->> 'insforge_subject_type'
    );
    v_subject_id := COALESCE(
      NEW.payload -> 'data' -> 'object' -> 'parent' -> 'subscription_details' -> 'metadata' ->> 'insforge_subject_id',
      NEW.payload -> 'data' -> 'object' -> 'metadata' ->> 'insforge_subject_id'
    );

    IF v_subject_id IS NULL THEN
      SELECT m.subject_type, m.subject_id INTO v_subject_type, v_subject_id
      FROM payments.customer_mappings m
      WHERE m.provider = NEW.provider
        AND m.environment = NEW.environment
        AND m.provider_customer_id = NEW.payload -> 'data' -> 'object' ->> 'customer';
    END IF;

    IF v_subject_id IS NOT NULL AND v_subject_type = 'user' THEN
      INSERT INTO public.user_entitlements (user_id, plan, active, updated_at)
      VALUES (v_subject_id::uuid, 'premium', TRUE, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        plan = 'premium',
        active = TRUE,
        updated_at = NOW();
    END IF;

  -- Razorpay Webhook Handler
  ELSIF NEW.provider = 'razorpay'
     AND NEW.event_type = 'subscription.charged'
     AND NEW.processing_status = 'processed' THEN

    v_subject_type := NEW.payload -> 'payload' -> 'subscription' -> 'entity' -> 'notes' ->> 'insforge_subject_type';
    v_subject_id := NEW.payload -> 'payload' -> 'subscription' -> 'entity' -> 'notes' ->> 'insforge_subject_id';

    IF v_subject_id IS NULL THEN
      SELECT m.subject_type, m.subject_id INTO v_subject_type, v_subject_id
      FROM payments.customer_mappings m
      WHERE m.provider = NEW.provider
        AND m.environment = NEW.environment
        AND m.provider_customer_id = NEW.payload -> 'payload' -> 'subscription' -> 'entity' ->> 'customer_id';
    END IF;

    IF v_subject_id IS NOT NULL AND v_subject_type = 'user' THEN
      INSERT INTO public.user_entitlements (user_id, plan, active, updated_at)
      VALUES (v_subject_id::uuid, 'premium', TRUE, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        plan = 'premium',
        active = TRUE,
        updated_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER grant_subscription_access_on_webhook
  AFTER INSERT OR UPDATE ON payments.webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_subscription_access_webhook();
