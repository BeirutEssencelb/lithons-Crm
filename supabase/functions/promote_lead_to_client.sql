-- Standalone function: Promote Lead to Client
-- Can be called directly: SELECT promote_lead_to_client_by_id('<lead_uuid>');
-- The trigger-based version in /triggers/on_lead_won_trigger.sql handles automatic promotion.

CREATE OR REPLACE FUNCTION promote_lead_to_client_by_id(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
  v_client_id UUID;
  v_lead RECORD;
BEGIN
  -- Fetch the lead
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

  IF v_lead IS NULL THEN
    RAISE EXCEPTION 'Lead with id % not found', p_lead_id;
  END IF;

  -- Check if client already exists for this lead
  SELECT id INTO v_client_id FROM clients WHERE lead_id = p_lead_id;

  IF v_client_id IS NOT NULL THEN
    RETURN v_client_id;
  END IF;

  -- Create the client
  INSERT INTO clients (first_name, last_name, email, phone, company, lead_id)
  VALUES (v_lead.first_name, v_lead.last_name, v_lead.email, v_lead.phone, v_lead.company, p_lead_id)
  RETURNING id INTO v_client_id;

  -- Update lead status to 'won'
  UPDATE leads SET status = 'won' WHERE id = p_lead_id;

  RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
