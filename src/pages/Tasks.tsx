
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Client, Task } from "../types";
import { supabase } from "../integrations/supabase/client";

const Tasks = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<(Task & { clientName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*");
          
        if (clientsError) throw clientsError;
        
        // For each client, fetch their tasks
        const allClients: Client[] = [];
        const allTasks: (Task & { clientName: string })[] = [];
        
        for (const clientData of clientsData) {
          const { data: tasksData } = await supabase
            .from("tasks")
            .select("*")
            .eq("client_id", clientData.id);
            
          const { data: serviceHistoryData } = await supabase
            .from("service_history")
            .select("*")
            .eq("client_id", clientData.id);
            
          const { data: clientTagsData } = await supabase
            .from("client_tags")
            .select("tag_id")
            .eq("client_id", clientData.id);
            
          let tagsData: any[] = [];
          if (clientTagsData && clientTagsData.length > 0) {
            const tagIds = clientTagsData.map(ct => ct.tag_id);
            const { data: tags } = await supabase
              .from("tags")
              .select("*")
              .in("id", tagIds);
              
            tagsData = tags || [];
          }
            
          const client: Client = {
            id: clientData.id,
            name: clientData.name,
            phone: clientData.phone,
            source: clientData.source,
            level: clientData.level,
            createdAt: new Date(clientData.created_at),
            updatedAt: new Date(clientData.updated_at),
            serviceHistory: serviceHistoryData?.map(sh => ({
              id: sh.id,
              clientId: sh.client_id,
              date: new Date(sh.date),
              observations: sh.observations,
              createdAt: new Date(sh.created_at)
            })) || [],
            tasks: [],
            tags: tagsData.map(tag => ({
              id: tag.id,
              name: tag.name,
              createdAt: new Date(tag.created_at)
            }))
          };
          
          // Process tasks
          const clientTasks = tasksData?.map(task => ({
            id: task.id,
            clientId: task.client_id,
            description: task.description,
            completed: task.completed,
            createdAt: new Date(task.created_at),
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            clientName: clientData.name
          })) || [];
          
          client.tasks = clientTasks;
          allClients.push(client);
          allTasks.push(...clientTasks);
        }
        
        setClients(allClients);
        setTasks(allTasks);
      } catch (error) {
        console.error("Error fetching tasks data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <p className="text-muted-foreground">
          Este é um placeholder para a página de tarefas. Implementação em breve.
        </p>
        
        <div className="py-10 text-center text-muted-foreground">
          {loading ? (
            <p>Carregando tarefas...</p>
          ) : (
            <p>Total de tarefas: {tasks.length}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;
