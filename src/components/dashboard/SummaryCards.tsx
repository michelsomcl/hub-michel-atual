
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
import { Client } from "../../types";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  filterKey: string;
  activeFilter: string | null;
  onClick: (filterKey: string, title: string) => void;
}

const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  filterKey,
  activeFilter, 
  onClick 
}: SummaryCardProps) => (
  <Card 
    className={`border card-hover cursor-pointer ${activeFilter === filterKey ? 'ring-2 ring-primary' : ''}`}
    onClick={() => onClick(filterKey, title)}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-full bg-${color}/10`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface SummaryCardsProps {
  totalClients: number;
  totalLeads: number;
  clientsToday: number;
  pendingTasks: number;
  activeFilter: string | null;
  onCardClick: (filterKey: string, title: string) => void;
}

export const SummaryCards = ({
  totalClients,
  totalLeads,
  clientsToday,
  pendingTasks,
  activeFilter,
  onCardClick
}: SummaryCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total de Clientes"
        value={totalClients}
        icon={<Users size={20} className="text-blue-600" />}
        color="blue-600"
        filterKey="totalClients"
        activeFilter={activeFilter}
        onClick={onCardClick}
      />
      <SummaryCard
        title="Total de Leads"
        value={totalLeads}
        icon={<Users size={20} className="text-purple-600" />}
        color="purple-600"
        filterKey="totalLeads"
        activeFilter={activeFilter}
        onClick={onCardClick}
      />
      <SummaryCard
        title="Novos Hoje"
        value={clientsToday}
        icon={<Calendar size={20} className="text-green-600" />}
        color="green-600"
        filterKey="clientsToday"
        activeFilter={activeFilter}
        onClick={onCardClick}
      />
      <SummaryCard
        title="Tarefas Pendentes"
        value={pendingTasks}
        icon={<Clock size={20} className="text-orange-600" />}
        color="orange-600"
        filterKey="pendingTasks"
        activeFilter={activeFilter}
        onClick={onCardClick}
      />
    </div>
  );
};
