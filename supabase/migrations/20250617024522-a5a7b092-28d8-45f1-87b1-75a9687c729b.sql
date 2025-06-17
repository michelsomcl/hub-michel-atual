
-- Atualizar a função para formatar o primeiro nome com apenas a primeira letra maiúscula
CREATE OR REPLACE FUNCTION public.handle_new_client_marketing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extrair primeiro nome do nome completo e formatar com primeira letra maiúscula
  INSERT INTO public.marketing_messages (client_id, first_name, phone)
  VALUES (
    NEW.id, 
    INITCAP(TRIM(SPLIT_PART(NEW.name, ' ', 1))), -- Primeiro nome com primeira letra maiúscula
    NEW.phone
  );
  RETURN NEW;
END;
$$;

-- Atualizar registros existentes para o formato correto
UPDATE public.marketing_messages 
SET first_name = INITCAP(first_name)
WHERE first_name != INITCAP(first_name);
