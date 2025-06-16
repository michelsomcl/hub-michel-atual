
-- Habilitar Row Level Security na tabela marketing_messages
ALTER TABLE public.marketing_messages ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT para todos (já que não há autenticação implementada)
CREATE POLICY "Allow public read access on marketing_messages" 
ON public.marketing_messages 
FOR SELECT 
USING (true);

-- Criar política para permitir INSERT para todos
CREATE POLICY "Allow public insert access on marketing_messages" 
ON public.marketing_messages 
FOR INSERT 
WITH CHECK (true);

-- Criar política para permitir UPDATE para todos
CREATE POLICY "Allow public update access on marketing_messages" 
ON public.marketing_messages 
FOR UPDATE 
USING (true);

-- Criar política para permitir DELETE para todos
CREATE POLICY "Allow public delete access on marketing_messages" 
ON public.marketing_messages 
FOR DELETE 
USING (true);
