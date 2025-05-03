
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Client } from "../types";
import { supabase } from "../integrations/supabase/client";

const Calendar = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Fetch all clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*");
          
        if (clientsError) throw clientsError;
        
        // For each client, fetch their service history
        const clientsWithHistory: Client[] = [];
        
        for (const clientData of clientsData) {
          const { data: serviceHistoryData } = await supabase
            .from("service_history")
            .select("*")
            .eq("client_id", clientData.id);
            
          const { data: tasksData } = await supabase
            .from("tasks")
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
          
          clientsWithHistory.push({
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
            tasks: tasksData?.map(task => ({
              id: task.id,
              clientId: task.client_id,
              description: task.description,
              completed: task.completed,
              createdAt: new Date(task.created_at),
              dueDate: task.due_date ? new Date(task.due_date) : undefined
            })) || [],
            tags: tagsData.map(tag => ({
              id: tag.id,
              name: tag.name,
              createdAt: new Date(tag.created_at)
            }))
          });
        }
        
        // Process appointments
        const processedAppointments: any[] = [];
        clientsWithHistory.forEach(client => {
          client.serviceHistory.forEach(history => {
            processedAppointments.push({
              client: client.name,
              date: history.date,
              notes: history.observations,
              type: "appointment"
            });
          });
          
          client.tasks.forEach(task => {
            if (task.dueDate) {
              processedAppointments.push({
                client: client.name,
                date: task.dueDate,
                notes: task.description,
                type: "task",
                completed: task.completed
              });
            }
          });
        });
        
        setClients(clientsWithHistory);
        setAppointments(processedAppointments);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="text-muted-foreground">
          Este é um placeholder para o calendário. Implementação em breve.
        </p>
        
        <div className="py-10 text-center text-muted-foreground">
          {loading ? (
            <p>Carregando dados...</p>
          ) : (
            <p>Calendário estará disponível em breve...</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
