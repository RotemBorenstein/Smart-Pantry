-- Fix all UNKNOWN states in inventory to MEDIUM (default)
-- Run this in Supabase SQL Editor

UPDATE inventory
SET state = 'MEDIUM'
WHERE state = 'UNKNOWN';

-- Also update any forecasts with UNKNOWN
UPDATE inventory_forecasts
SET predicted_state = 'MEDIUM'
WHERE predicted_state = 'UNKNOWN';

SELECT 'Fixed UNKNOWN states!' as status;

