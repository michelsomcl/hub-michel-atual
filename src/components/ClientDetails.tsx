import React, { useState } from "react";
import { Client, ServiceHistory, Task, Tag } from "../types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber, formatDate, generateId } from "../lib/utils";
import { ServiceHistoryForm } from "./ServiceHistoryForm";
import { TaskItem } from "./TaskItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientDetailsProps {
  client: Client;
  availableTags: Tag[];
  onServiceHistoryAdd: (history: ServiceHistory) => void;
  onTaskAdd: (task: Task) => void;
  onTaskComplete: (taskId: string, completed: boolean) => void;
  onEditClick: () => void;
}

export const ClientDetails = ({
  client,
  availableTags,
  onServiceHistoryAdd,
  onTaskAdd,
  onTaskComplete,
  onEditClick,
}: ClientDetailsProps) => {
  const [newTask, setNewTask] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: generateId(),
      clientId: client.id,
      description: newTask,
      completed: false,
      createdAt: new Date(),
      dueDate: taskDueDate ? new Date(taskDueDate) : undefined,
    };
    
    onTaskAdd(task);
    setNewTask("");
    setTaskDueDate("");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{client.name}</h1>
            <Badge variant={client.level === "Cliente" ? "default" : "outline"}>
              {client.level}
            </Badge>
          </div>
          
          <div className="mt-2 text-muted-foreground">
            <p>📱 {formatPhoneNumber(client.phone)}</p>
            <p>📊 Fonte: {client.source}</p>
            <p>📆 Cadastrado em: {formatDate(client.createdAt)}</p>
            <p>🔄 Última atualização: {formatDate(client.updatedAt)}</p>
          </div>
        </div>
        
        <Button onClick={onEditClick} className="btn-secondary">
          Editar Cliente
        </Button>
      </div>
      
      {client.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag) => (
              <Badge 
                key={tag.id} 
                className="py-1"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <Separator />
      
      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">
            Histórico de Atendimento ({client.serviceHistory.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tarefas ({client.tasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-6 pt-4">
          <div className="bg-muted/30 rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-4">Novo Atendimento</h3>
            <ServiceHistoryForm 
              clientId={client.id} 
              onSubmit={onServiceHistoryAdd} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Histórico</h3>
            
            {client.serviceHistory.length === 0 ? (
              <p className="text-muted-foreground py-4">Nenhum atendimento registrado</p>
            ) : (
              <div className="space-y-4">
                {[...client.serviceHistory]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((history) => (
                    <div key={history.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{formatDate(history.date)}</h4>
                        <span className="text-sm text-muted-foreground">
                          Registrado em: {formatDate(history.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap">{history.observations}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6 pt-4">
          <div className="bg-muted/30 rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-4">Nova Tarefa</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <Label htmlFor="taskDescription">Descrição</Label>
                <Input
                  id="taskDescription"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Descrição da tarefa"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dueDate">Data de Vencimento (Opcional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="btn-primary">
                Adicionar Tarefa
              </Button>
            </form>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Tarefas</h3>
              <span className="text-sm text-muted-foreground">
                {client.tasks.filter(t => !t.completed).length} pendentes / {client.tasks.length} total
              </span>
            </div>
            
            {client.tasks.length === 0 ? (
              <p className="text-muted-foreground py-4">Nenhuma tarefa registrada</p>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden bg-white">
                {[...client.tasks]
                  .sort((a, b) => {
                    // First by completion status
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1;
                    }
                    // Then by due date (if available)
                    if (a.dueDate && b.dueDate) {
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    }
                    if (a.dueDate) return -1;
                    if (b.dueDate) return 1;
                    // Finally by creation date
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onComplete={onTaskComplete} 
                    />
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
