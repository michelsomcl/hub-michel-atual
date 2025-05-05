import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, Client } from "../types";
import { getClients } from "../services/localStorage";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarView = "day" | "week" | "month";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [taskDates, setTaskDates] = useState<Date[]>([]);

  // Load all clients and their tasks from localStorage
  useEffect(() => {
    const loadedClients = getClients();
    setClients(loadedClients);

    // Extract all tasks from all clients
    const allTasks: Task[] = [];
    const allTaskDates: Date[] = [];
    
    loadedClients.forEach(client => {
      client.tasks.forEach(task => {
        const enhancedTask = {
          ...task,
          clientName: client.name
        } as Task & { clientName: string };
        
        allTasks.push(enhancedTask);
        
        // Add task date to taskDates array for marking in calendar
        if (task.dueDate) {
          allTaskDates.push(new Date(task.dueDate));
        }
      });
    });

    setTasks(allTasks);
    setTaskDates(allTaskDates);
  }, []);

  // Filter tasks based on selected date and view
  useEffect(() => {
    let filtered = [...tasks];

    if (view === "day") {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate).toDateString() === selectedDate.toDateString();
      });
    } else if (view === "week") {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
    } else if (view === "month") {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedDate, view]);

  // Get the client name for a specific client ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  };

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

  // Render different views based on the selected view type
  const renderTasksList = () => {
    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhuma tarefa encontrada para este período</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{task.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {(task as any).clientName || getClientName(task.clientId)}
                  </p>
                </div>
                <Badge variant={task.completed ? "default" : "outline"}>
                  {task.completed ? "Concluída" : "Pendente"}
                </Badge>
              </div>
              {task.dueDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Data: {format(new Date(task.dueDate), "dd/MM/yyyy")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as tarefas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <Tabs defaultValue="month" value={view} onValueChange={(value) => setView(value as CalendarView)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {format(selectedDate, "MMMM yyyy")}
              </h2>
              <TabsList>
                <TabsTrigger value="day">Dia</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
              <Card>
                <CardContent className="p-0 pt-6">
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
                </CardContent>
              </Card>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {view === "day" && format(selectedDate, "dd 'de' MMMM 'de' yyyy")}
                      {view === "week" && `Semana de ${format(selectedDate, "dd/MM/yyyy")}`}
                      {view === "month" && format(selectedDate, "MMMM 'de' yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTasksList()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
