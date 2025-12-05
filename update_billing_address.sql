ALTER TABLE public.orders
ADD COLUMN billing_address_line1 TEXT,
ADD COLUMN billing_city TEXT,
ADD COLUMN billing_postal_code TEXT,
ADD COLUMN billing_country TEXT,
ADD COLUMN billing_name TEXT;
