
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientDetails as ClientDetailsComponent } from "../components/ClientDetails";
import { ClientForm } from "../components/ClientForm";
import { Client, ServiceHistory, Task, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { getClients, saveClients, getTags, saveClient } from "../services/localStorage";

const ClientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Load client and tags from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get all clients from Supabase
        const clients = await getClients();
        const loadedTags = await getTags();
        
        // Find client with the given ID
        const foundClient = clients.find(c => c.id === id);
        
        if (foundClient) {
          setClient(foundClient);
          setTags(loadedTags);
        } else {
          navigate("/clients", { replace: true });
          toast({
            title: "Cliente não encontrado",
            description: "O cliente solicitado não foi encontrado.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados do cliente.",
          variant: "destructive"
        });
        navigate("/clients", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);
  
  const handleServiceHistoryAdd = async (history: ServiceHistory) => {
    if (!client) return;
    
    setSaving(true);
    try {
      const updatedClient = {
        ...client,
        serviceHistory: [...client.serviceHistory, history],
        updatedAt: new Date()
      };
      
      // Update client in state
      setClient(updatedClient);
      
      // Update client in Supabase
      await saveClient(updatedClient);
      
      toast({
        title: "Atendimento registrado",
        description: "O histórico de atendimento foi atualizado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao registrar atendimento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o atendimento.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleTaskAdd = async (task: Task) => {
    if (!client) return;
    
    setSaving(true);
    try {
      const updatedClient = {
        ...client,
        tasks: [...client.tasks, task],
        updatedAt: new Date()
      };
      
      // Update client in state
      setClient(updatedClient);
      
      // Update client in Supabase
      await saveClient(updatedClient);
      
      toast({
        title: "Tarefa adicionada",
        description: "A nova tarefa foi adicionada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a tarefa.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (!client) return;
    
    setSaving(true);
    try {
      const updatedTasks = client.tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      const updatedClient = {
        ...client,
        tasks: updatedTasks,
        updatedAt: new Date()
      };
      
      // Update client in state
      setClient(updatedClient);
      
      // Update client in Supabase
      await saveClient(updatedClient);
      
      toast({
        title: completed ? "Tarefa concluída" : "Tarefa reaberta",
        description: completed 
          ? "A tarefa foi marcada como concluída." 
          : "A tarefa foi marcada como pendente."
      });
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a tarefa.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleClientUpdate = async (updatedClient: Client) => {
    setSaving(true);
    try {
      // Update client in state
      setClient(updatedClient);
      
      // Update client in Supabase
      await saveClient(updatedClient);
      
      setIsEditing(false);
      
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleTagCreate = async (newTag: Tag) => {
    try {
      // Update state
      setTags(prevTags => [...prevTags, newTag]);
      
      // Save to Supabase
      await saveTags([...tags, newTag]);
    } catch (error) {
      console.error("Erro ao criar tag:", error);
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
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Carregando informações do cliente...</p>
        </div>
      </Layout>
    );
  }
  
  if (!client) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cliente não encontrado.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/clients")}
            className="flex items-center gap-1 mb-4"
          >
            <ArrowLeft size={16} />
            Voltar para a lista de clientes
          </Button>
        </div>
        
        {isEditing ? (
          <>
            <h1 className="text-2xl font-semibold">Editar Cliente</h1>
            
            <ClientForm 
              client={client}
              availableTags={tags}
              onSubmit={handleClientUpdate}
              onCreateTag={handleTagCreate}
              isLoading={saving}
            />
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <ClientDetailsComponent 
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
