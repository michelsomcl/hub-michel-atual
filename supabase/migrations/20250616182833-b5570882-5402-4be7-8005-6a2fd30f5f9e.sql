
-- Criar tabela para mensagens de marketing
CREATE TABLE public.marketing_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  phone text NOT NULL,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_marketing_messages_updated_at
  BEFORE UPDATE ON public.marketing_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Criar função para automaticamente adicionar clientes na tabela de marketing
CREATE OR REPLACE FUNCTION public.handle_new_client_marketing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Criar trigger para adicionar automaticamente novos clientes na tabela de marketing
CREATE TRIGGER on_client_created_marketing
  AFTER INSERT ON public.clients
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_client_marketing();

-- Popular a tabela com clientes existentes
INSERT INTO public.marketing_messages (client_id, first_name, phone)
SELECT 
  id,
  TRIM(SPLIT_PART(name, ' ', 1)) as first_name,
  phone
FROM public.clients
WHERE id NOT IN (SELECT client_id FROM public.marketing_messages);
