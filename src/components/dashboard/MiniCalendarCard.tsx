
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "react-router-dom";
import { getClients } from "../../services/localStorage";
import { Task } from "../../types";

export const MiniCalendarCard = () => {
  const [taskDates, setTaskDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
    // Extract all task dates from clients
    const clients = getClients();
    const allTaskDates: Date[] = [];
    
    clients.forEach(client => {
      client.tasks.forEach(task => {
        if (task.dueDate) {
          allTaskDates.push(new Date(task.dueDate));
        }
      });
    });
    
    setTaskDates(allTaskDates);
  }, []);
  
  // Function to check if a date has tasks
  const hasTasksOnDate = (date: Date): boolean => {
    return taskDates.some(taskDate => 
      taskDate.getDate() === date.getDate() && 
      taskDate.getMonth() === date.getMonth() && 
      taskDate.getFullYear() === date.getFullYear()
    );
  };
  
  return (
    <Card className="border card-hover">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Calendário</h2>
          <Link to="/calendar" className="text-primary hover:underline text-sm">
            Ver Completo
          </Link>
        </div>
        
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border-0"
            modifiers={{
              hasTasks: (date) => hasTasksOnDate(date)
            }}
            modifiersStyles={{
              hasTasks: { 
                backgroundColor: "#1e40af", 
                color: "white",
                fontWeight: "bold"
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
