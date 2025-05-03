
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { Client, ServiceHistory, Task, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { ClientDetailsHeader } from "../components/client-details/ClientDetailsHeader";
import { LoadingState } from "../components/client-details/LoadingState";
import { NotFoundState } from "../components/client-details/NotFoundState";
import { ClientDetailsView } from "../components/client-details/ClientDetailsView";
import { ClientEditView } from "../components/client-details/ClientEditView";
import { useClient } from "../hooks/useClient";
import { useTags } from "../hooks/useTags";

const ClientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const { client, loading, saving, fetchClient, updateClient, addServiceHistory, addTask, updateTaskStatus } = useClient();
  const { tags, createTag } = useTags();
  
  // Load client data when component mounts
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      const loadedClient = await fetchClient(id);
      
      if (!loadedClient) {
        navigate("/clients", { replace: true });
        toast({
          title: "Cliente não encontrado",
          description: "O cliente solicitado não foi encontrado.",
          variant: "destructive"
        });
      }
    };
    
    loadData();
  }, [id, navigate, fetchClient]);
  
  const handleServiceHistoryAdd = async (history: ServiceHistory) => {
    if (!client) return;
    
    const success = await addServiceHistory(history);
    
    if (success) {
      toast({
        title: "Atendimento registrado",
        description: "O histórico de atendimento foi atualizado com sucesso."
      });
    } else {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o atendimento.",
        variant: "destructive"
      });
    }
  };
  
  const handleTaskAdd = async (task: Task) => {
    if (!client) return;
    
    const success = await addTask(task);
    
    if (success) {
      toast({
        title: "Tarefa adicionada",
        description: "A nova tarefa foi adicionada com sucesso."
      });
    } else {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a tarefa.",
        variant: "destructive"
      });
    }
  };
  
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (!client) return;
    
    const success = await updateTaskStatus(taskId, completed);
    
    if (success) {
      toast({
        title: completed ? "Tarefa concluída" : "Tarefa reaberta",
        description: completed 
          ? "A tarefa foi marcada como concluída." 
          : "A tarefa foi marcada como pendente."
      });
    } else {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a tarefa.",
        variant: "destructive"
      });
    }
  };
  
  const handleClientUpdate = async (updatedClient: Client) => {
    const success = await updateClient(updatedClient);
    
    if (success) {
      setIsEditing(false);
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso."
      });
    } else {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive"
      });
    }
  };
  
  const handleTagCreate = async (newTag: Tag) => {
    const success = await createTag(newTag);
    
    if (success) {
      toast({
        title: "Tag criada", 
        description: `A tag "${newTag.name}" foi criada com sucesso.`
      });
    } else {
      toast({
        title: "Erro", 
        description: "Ocorreu um erro ao criar a tag.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }
  
  if (!client) {
    return (
      <Layout>
        <NotFoundState />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <ClientDetailsHeader />
        
        {isEditing ? (
          <ClientEditView 
            client={client}
            tags={tags}
            onSubmit={handleClientUpdate}
            onCreateTag={handleTagCreate}
            onCancel={() => setIsEditing(false)}
            isSaving={saving}
          />
        ) : (
          <ClientDetailsView
            client={client}
            availableTags={tags}
            onServiceHistoryAdd={handleServiceHistoryAdd}
            onTaskAdd={handleTaskAdd}
            onTaskComplete={handleTaskComplete}
            onEditClick={() => setIsEditing(true)}
            isSaving={saving}
          />
        )}
      </div>
    </Layout>
  );
};

export default ClientDetailsPage;
