
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ClientDetails as ClientDetailsComponent } from "../components/ClientDetails";
import { ClientForm } from "../components/ClientForm";
import { Client, ServiceHistory, Task, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { getClientWithRelations, getTags, saveClient, addServiceHistory, addTask, updateTaskCompletion, saveTag } from "../services/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { generateId } from "../lib/utils";

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        setIsLoading(true);
        
        // Buscar o cliente
        const clientData = await getClientWithRelations(id);
        if (!clientData) {
          throw new Error("Cliente não encontrado");
        }
        setClient(clientData);
        
        // Buscar tags disponíveis
        const tagsData = await getTags();
        setAvailableTags(tagsData);
      } catch (error) {
        console.error("Erro ao carregar dados do cliente:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do cliente. Tente novamente.",
          variant: "destructive"
        });
        navigate("/clients");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  // Função para atualizar cliente
  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      const savedClient = await saveClient(updatedClient);
      if (!savedClient) {
        throw new Error("Erro ao atualizar cliente");
      }
      
      setClient(savedClient);
      setIsEditing(false);
      
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Função para adicionar histórico de serviço
  const handleAddServiceHistory = async (history: ServiceHistory) => {
    try {
      if (!client) return;
      
      // Adicionar ID e cliente ID ao histórico
      const historyWithId: ServiceHistory = {
        ...history,
        id: history.id || generateId(),
        clientId: client.id
      };
      
      const savedHistory = await addServiceHistory(historyWithId);
      if (!savedHistory) {
        throw new Error("Erro ao adicionar histórico");
      }
      
      // Atualizar o cliente local com o novo histórico
      setClient({
        ...client,
        serviceHistory: [...client.serviceHistory, savedHistory]
      });
      
      toast({
        title: "Atendimento registrado",
        description: "O registro de atendimento foi adicionado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar histórico de serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o atendimento. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Função para adicionar tarefa
  const handleAddTask = async (task: Task) => {
    try {
      if (!client) return;
      
      // Adicionar ID e cliente ID à tarefa
      const taskWithId: Task = {
        ...task,
        id: task.id || generateId(),
        clientId: client.id
      };
      
      const savedTask = await addTask(taskWithId);
      if (!savedTask) {
        throw new Error("Erro ao adicionar tarefa");
      }
      
      // Atualizar o cliente local com a nova tarefa
      setClient({
        ...client,
        tasks: [...client.tasks, savedTask]
      });
      
      toast({
        title: "Tarefa adicionada",
        description: "A tarefa foi adicionada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Função para marcar tarefa como concluída/não concluída
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      if (!client) return;
      
      const success = await updateTaskCompletion(taskId, completed);
      if (!success) {
        throw new Error("Erro ao atualizar status da tarefa");
      }
      
      // Atualizar o cliente local com o novo status da tarefa
      setClient({
        ...client,
        tasks: client.tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      });
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Função para criar nova tag
  const handleCreateTag = async (tag: Tag) => {
    try {
      const savedTag = await saveTag(tag);
      if (!savedTag) {
        throw new Error("Erro ao criar tag");
      }
      
      // Atualizar lista local de tags
      setAvailableTags(prev => [...prev, savedTag]);
      
      toast({
        title: "Tag criada",
        description: `A tag "${tag.name}" foi criada com sucesso.`
      });
      
      return savedTag;
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tag. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-muted-foreground">Cliente não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isEditing ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Atualize as informações do cliente conforme necessário.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <ClientForm 
              client={client}
              availableTags={availableTags}
              onSubmit={handleUpdateClient}
              onCreateTag={handleCreateTag}
            />
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <ClientDetailsComponent 
          client={client}
          availableTags={availableTags}
          onServiceHistoryAdd={handleAddServiceHistory}
          onTaskAdd={handleAddTask}
          onTaskComplete={handleTaskComplete}
          onEditClick={() => setIsEditing(true)}
        />
      )}
    </Layout>
  );
};

export default ClientDetails;
