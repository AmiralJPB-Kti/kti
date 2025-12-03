ALTER TABLE public.orders
ADD COLUMN source TEXT NOT NULL DEFAULT 'stripe',
ADD COLUMN invoice_number TEXT UNIQUE,
ADD COLUMN payment_method TEXT,
ADD COLUMN admin_notes TEXT,
ADD COLUMN customer_name_offline TEXT,
ADD COLUMN customer_email_offline TEXT;

CREATE TABLE public.invoice_sequences (
    year INTEGER PRIMARY KEY,
    last_sequence_number BIGINT NOT NULL DEFAULT 0,
    prefix TEXT NOT NULL DEFAULT 'FAC-',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.get_next_invoice_number(current_year INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_seq BIGINT;
    invoice_prefix TEXT;
    current_prefix TEXT;
BEGIN
    SELECT prefix INTO current_prefix FROM public.invoice_sequences WHERE year = current_year;
    IF current_prefix IS NULL THEN
        current_prefix := 'FAC-';
    END IF;

    INSERT INTO public.invoice_sequences (year, last_sequence_number, prefix)
    VALUES (current_year, 1, current_prefix)
    ON CONFLICT (year) DO UPDATE SET
        last_sequence_number = public.invoice_sequences.last_sequence_number + 1,
        updated_at = NOW()
    RETURNING last_sequence_number, prefix INTO next_seq, invoice_prefix;

    RETURN invoice_prefix || current_year || '-' || LPAD(next_seq::TEXT, 5, '0');
END;
$$;