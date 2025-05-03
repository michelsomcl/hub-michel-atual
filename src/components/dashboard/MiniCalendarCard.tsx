
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../../types";
import { supabase } from "../../integrations/supabase/client";

export const MiniCalendarCard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(true);
      try {
        // Fetch clients data
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("id, name");
          
        if (clientsError) throw clientsError;
        
        // Get upcoming service history and tasks with due dates
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const events = [];
        
        for (const client of clientsData) {
          // Get tasks with due dates in the next week
          const { data: tasks } = await supabase
            .from("tasks")
            .select("*")
            .eq("client_id", client.id)
            .eq("completed", false)
            .gte("due_date", today.toISOString())
            .lte("due_date", nextWeek.toISOString());
            
          if (tasks && tasks.length > 0) {
            for (const task of tasks) {
              events.push({
                type: "task",
                clientName: client.name,
                date: new Date(task.due_date),
                description: task.description
              });
            }
          }
        }
        
        // Sort events by date
        events.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        setUpcomingEvents(events.slice(0, 5)); // Show only 5 events
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcomingEvents();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando eventos...</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento nos próximos 7 dias</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-sm font-medium">{event.clientName}</span>
                <span className="text-xs text-muted-foreground">
                  {event.date.toLocaleDateString('pt-BR')} - {event.type === "task" ? "Tarefa" : "Atendimento"}
                </span>
                <p className="text-xs mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
