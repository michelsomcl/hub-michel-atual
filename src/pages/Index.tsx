
import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Client } from "../types";
import { getClients, getTags, initializeLocalStorage } from "../services/localStorage";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { FilteredClientsList } from "../components/dashboard/FilteredClientsList";
import { RecentClientsCard } from "../components/dashboard/RecentClientsCard";
import { MiniCalendarCard } from "../components/dashboard/MiniCalendarCard";

const Index = () => {
  const [totalClients, setTotalClients] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [clientsToday, setClientsToday] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterTitle, setFilterTitle] = useState<string>("");
  
  useEffect(() => {
    initializeLocalStorage();
    
    const clients = getClients();
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
  }, []);
  
  const handleCardClick = (filterKey: string, title: string) => {
    if (activeFilter === filterKey) {
      clearFilter();
      return;
    }

    setActiveFilter(filterKey);
    setFilterTitle(title);
    
    let filtered: Client[] = [];
    
    switch(filterKey) {
      case 'totalClients':
        filtered = [...allClients];
        break;
      case 'totalLeads':
        filtered = allClients.filter(client => client.level === 'Lead');
        break;
      case 'clientsToday':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = allClients.filter(client => {
          const clientDate = new Date(client.createdAt);
          clientDate.setHours(0, 0, 0, 0);
          return clientDate.getTime() === today.getTime();
        });
        break;
      case 'pendingTasks':
        filtered = allClients.filter(client => 
          client.tasks.some(task => !task.completed)
        );
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
