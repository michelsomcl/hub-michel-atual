
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "react-router-dom";
import { getClients } from "../../services/localStorage";
import { Task } from "../../types";
import { Calendar as CalendarIcon } from "lucide-react";

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
          // Make sure we normalize the date to midnight
          const normalizedDate = new Date(task.dueDate);
          normalizedDate.setHours(0, 0, 0, 0);
          allTaskDates.push(normalizedDate);
        }
      });
    });
    
    setTaskDates(allTaskDates);
  }, []);
  
  // Function to check if a date has tasks
  const hasTasksOnDate = (date: Date): boolean => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    return taskDates.some(taskDate => {
      const normalizedTaskDate = new Date(taskDate);
      normalizedTaskDate.setHours(0, 0, 0, 0);
      return normalizedTaskDate.getTime() === normalizedDate.getTime();
    });
  };
  
  // Function to check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
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
              hasTasks: (date) => hasTasksOnDate(date),
              today: (date) => isToday(date)
            }}
            modifiersStyles={{
              hasTasks: { 
                backgroundColor: "#3b82f6", // blue-500
                color: "white",
                fontWeight: "bold"
              },
              today: {
                backgroundColor: "#1e40af", // blue-800
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
