-- Function: Check inventory threshold and flag items when stock is low
-- File: check_inventory_threshold.sql

CREATE OR REPLACE FUNCTION check_inventory_threshold()
RETURNS TRIGGER AS $$
BEGIN
  -- Flag the item if stock_quantity is at or below threshold_level
  IF NEW.stock_quantity <= NEW.threshold_level THEN
    NEW.is_flagged = TRUE;
  ELSE
    NEW.is_flagged = FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to inventory table (fires BEFORE insert/update)
DROP TRIGGER IF EXISTS on_inventory_stock_change ON inventory;

CREATE TRIGGER on_inventory_stock_change
  BEFORE INSERT OR UPDATE OF stock_quantity, threshold_level ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_threshold();

-- ============================================================================
-- Standalone function for manual batch-checking of all inventory
-- Usage: SELECT check_all_inventory_thresholds();
-- ============================================================================

CREATE OR REPLACE FUNCTION check_all_inventory_thresholds()
RETURNS TABLE (id UUID, product_name TEXT, stock_quantity NUMERIC, threshold_level NUMERIC, is_flagged BOOLEAN) AS $$
BEGIN
  -- Update all flagged states in bulk
  UPDATE inventory
  SET is_flagged = (stock_quantity <= threshold_level);

  -- Return all flagged items
  RETURN QUERY
  SELECT i.id, i.product_name, i.stock_quantity, i.threshold_level, i.is_flagged
  FROM inventory i
  WHERE i.is_flagged = TRUE;
END;
$$ LANGUAGE plpgsql;
