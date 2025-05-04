
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Task, Client } from "../types";
import { getClients } from "../services/localStorage";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  ListChecks, 
  CalendarRange, 
  ChevronRight, 
  Square 
} from "lucide-react";

// Extended task with client information
interface ExtendedTask extends Task {
  clientName: string;
  clientId: string;
}

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ExtendedTask[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  useEffect(() => {
    const clients = getClients();
    
    const allTasks: ExtendedTask[] = [];
    clients.forEach(client => {
      client.tasks.forEach(task => {
        allTasks.push({
          ...task,
          clientName: client.name,
          clientId: client.id
        });
      });
    });
    
    // Sort tasks by due date if available, otherwise by creation date
    const sortedTasks = allTasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt);
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    setTasks(sortedTasks);
    setFilteredTasks(sortedTasks);
  }, []);
  
  useEffect(() => {
    let result = [...tasks];
    
    // Apply status filter
    if (filter === "pending") {
      result = result.filter(task => !task.completed);
    } else if (filter === "completed") {
      result = result.filter(task => task.completed);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        task => 
          task.description.toLowerCase().includes(lowerSearchTerm) ||
          task.clientName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredTasks(result);
  }, [filter, searchTerm, tasks]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Sem data";
    return new Date(date).toLocaleDateString("pt-BR");
  };
  
  const renderTaskStatus = (completed: boolean) => {
    if (completed) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckSquare size={14} className="mr-1" />
          Concluída
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <Square size={14} className="mr-1" />
        Pendente
      </Badge>
    );
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tarefas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as tarefas de seus clientes.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <Tabs defaultValue="all" className="w-full max-w-md" onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-full md:max-w-md">
            <SearchBar onSearch={handleSearch} placeholder="Buscar por descrição ou cliente..." />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm divide-y">
          <div className="p-4 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="text-muted-foreground" size={18} />
              <span className="font-medium">
                {filteredTasks.length} {filteredTasks.length === 1 ? "tarefa" : "tarefas"}
              </span>
            </div>
          </div>
          
          {filteredTasks.length > 0 ? (
            <div className="divide-y">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm text-primary"
                          onClick={() => navigate(`/clients/${task.clientId}`)}
                        >
                          {task.clientName}
                        </Button>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <CalendarRange size={14} />
                          {formatDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {renderTaskStatus(task.completed)}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/clients/${task.clientId}`)}
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-2">Nenhuma tarefa encontrada</p>
              <p className="text-sm text-muted-foreground">
                Adicione novas tarefas na página de detalhes de cada cliente.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;
