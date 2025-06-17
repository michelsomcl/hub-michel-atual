
-- Corrigir o search_path da função handle_new_client_marketing
CREATE OR REPLACE FUNCTION public.handle_new_client_marketing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extrair primeiro nome do nome completo
  INSERT INTO public.marketing_messages (client_id, first_name, phone)
  VALUES (
    NEW.id, 
    TRIM(SPLIT_PART(NEW.name, ' ', 1)), -- Primeiro nome
    NEW.phone
  );
  RETURN NEW;
END;
$$;
