
import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Client, Task } from "../types";
import { getClients, getTags, clearLocalStorage } from "../services/supabaseClient";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { FilteredClientsList } from "../components/dashboard/FilteredClientsList";
import { RecentClientsCard } from "../components/dashboard/RecentClientsCard";
import { MiniCalendarCard } from "../components/dashboard/MiniCalendarCard";
import { toast } from "@/hooks/use-toast";

interface ClientWithTask extends Client {
  pendingTask?: Task;
}

const Index = () => {
  const [totalClients, setTotalClients] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [clientsToday, setClientsToday] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterTitle, setFilterTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Clear localStorage when mounting to ensure no conflicts with Supabase
    clearLocalStorage();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar clientes do Supabase
        const clients = await getClients();
        setAllClients(clients);
        
        setTotalClients(clients.length);
        
        setTotalLeads(clients.filter(client => client.level === "Lead").length);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setClientsToday(clients.filter(client => {
          const clientDate = new Date(client.createdAt);
          clientDate.setHours(0, 0, 0, 0);
          return clientDate.getTime() === today.getTime();
        }).length);
        
        const totalPendingTasks = clients.reduce((total, client) => {
          return total + client.tasks.filter(task => !task.completed).length;
        }, 0);
        setPendingTasks(totalPendingTasks);
        
        const sortedClients = [...clients].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentClients(sortedClients.slice(0, 5));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCardClick = (filterKey: string, title: string) => {
    if (activeFilter === filterKey) {
      clearFilter();
      return;
    }

    setActiveFilter(filterKey);
    setFilterTitle(title);
    
    let filtered: ClientWithTask[] = [];
    
    switch(filterKey) {
      case 'totalClients':
        filtered = [...allClients] as ClientWithTask[];
        break;
      case 'totalLeads':
        filtered = allClients.filter(client => client.level === 'Lead') as ClientWithTask[];
        break;
      case 'clientsToday':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = allClients.filter(client => {
          const clientDate = new Date(client.createdAt);
          clientDate.setHours(0, 0, 0, 0);
          return clientDate.getTime() === today.getTime();
        }) as ClientWithTask[];
        break;
      case 'pendingTasks':
        filtered = allClients
          .filter(client => client.tasks.some(task => !task.completed))
          .map(client => {
            // Find the first pending task for this client
            const pendingTask = client.tasks.find(task => !task.completed);
            
            // Return client with the pending task attached
            return {
              ...client,
              pendingTask: pendingTask
            };
          });
        
        // Sort by due date if available
        filtered.sort((a, b) => {
          const dateA = a.pendingTask?.dueDate ? new Date(a.pendingTask.dueDate) : new Date();
          const dateB = b.pendingTask?.dueDate ? new Date(b.pendingTask.dueDate) : new Date();
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        filtered = [];
    }
    
    setFilteredClients(filtered);
  };

  const clearFilter = () => {
    setActiveFilter(null);
    setFilteredClients([]);
    setFilterTitle("");
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <DashboardHeader />
        
        <SummaryCards 
          totalClients={totalClients}
          totalLeads={totalLeads}
          clientsToday={clientsToday}
          pendingTasks={pendingTasks}
          activeFilter={activeFilter}
          onCardClick={handleCardClick}
        />

        <FilteredClientsList 
          activeFilter={activeFilter}
          filteredClients={filteredClients}
          filterTitle={filterTitle}
          onClearFilter={clearFilter}
        />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <RecentClientsCard recentClients={recentClients} />
          <MiniCalendarCard />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
