-- Add units_per_pack column to productos table
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS units_per_pack INTEGER DEFAULT 1;

COMMENT ON COLUMN productos.units_per_pack IS 'Preferred split factor for packs (e.g. 6 for a pack of 6 units)';
