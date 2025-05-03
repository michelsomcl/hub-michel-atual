import React, { useState, useEffect } from 'react';
import { Calendar as ShadCalendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '../integrations/supabase/client';
import { ClientLevel } from '../types';

interface Client {
  id: string;
  name: string;
  phone: string;
  source: string;
  level: string;
  created_at: string;
  updated_at: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState<string>('');

  const { data: clientsData, error, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    if (clientsData) {
      setClients(clientsData);
    }
  }, [clientsData]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar os dados.</div>;
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
          <CardDescription>
            Selecione um dia para ver os clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between p-4">
            <Label htmlFor="search">Buscar Cliente:</Label>
            <Input
              type="search"
              id="search"
              placeholder="Digite o nome do cliente..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <ShadCalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <ShadCalendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2023-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <ul>
              {filteredClients.map((client) => {
                const clientData = {
                  id: client.id,
                  name: client.name,
                  phone: client.phone,
                  source: client.source,
                  level: client.level as ClientLevel, // Ensure proper type casting
                  serviceHistory: [],
                  tasks: [],
                  tags: [],
                  createdAt: new Date(client.created_at),
                  updatedAt: new Date(client.updated_at)
                };

                return (
                  <li key={client.id}>
                    {client.name} - {client.phone} - {client.level}
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function ShadCalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

export default Calendar;
