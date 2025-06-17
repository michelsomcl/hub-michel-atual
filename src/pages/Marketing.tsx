
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare } from "lucide-react";
import { MarketingFilters } from "../components/MarketingFilters";
import { useMarketingFilters } from "../hooks/useMarketingFilters";
import { 
  getMarketingMessages, 
  updateMarketingMessages, 
  sendToWebhook,
  type MarketingMessage 
} from "../services/marketingService";

const Marketing = () => {
  const [messages, setMessages] = useState<MarketingMessage[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Hook de filtros
  const { 
    filters, 
    filteredMessages, 
    handleFilterChange, 
    clearFilters 
  } = useMarketingFilters(messages);

  // Carregar mensagens de marketing
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const data = await getMarketingMessages();
        setMessages(data);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens de marketing.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Extrair tags únicas de todas as mensagens
  const allTags = messages.reduce((acc, msg) => {
    if (msg.tags) {
      msg.tags.forEach(tag => {
        if (!acc.some(t => t.id === tag.id)) {
          acc.push(tag);
        }
      });
    }
    return acc;
  }, [] as any[]);

  // Selecionar/deselecionar cliente
  const handleClientSelection = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  // Selecionar/deselecionar todos (baseado nos filtrados)
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(filteredMessages.map(msg => msg.client_id));
    } else {
      setSelectedClients([]);
    }
  };

  // Atribuir mensagem aos clientes selecionados
  const handleAssignMessage = async () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um cliente.",
        variant: "destructive"
      });
      return;
    }

    if (!bulkMessage.trim()) {
      toast({
        title: "Atenção", 
        description: "Digite uma mensagem para atribuir.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await updateMarketingMessages(selectedClients, bulkMessage);
      
      if (success) {
        // Recarregar mensagens
        const updatedMessages = await getMarketingMessages();
        setMessages(updatedMessages);
        
        toast({
          title: "Sucesso",
          description: `Mensagem atribuída para ${selectedClients.length} cliente(s).`
        });
        
        setBulkMessage("");
        setSelectedClients([]);
      } else {
        throw new Error("Falha ao atualizar mensagens");
      }
    } catch (error) {
      console.error("Erro ao atribuir mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a mensagem.",
        variant: "destructive"
      });
    }
  };

  // Enviar para webhook
  const handleSendToWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Atenção",
        description: "Digite a URL do webhook.",
        variant: "destructive"
      });
      return;
    }

    const selectedMessages = filteredMessages.filter(msg => 
      selectedClients.includes(msg.client_id) && msg.message
    );

    if (selectedMessages.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione clientes que tenham mensagens atribuídas.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      await sendToWebhook(webhookUrl, selectedMessages);
      
      toast({
        title: "Sucesso",
        description: `${selectedMessages.length} mensagem(s) enviada(s) para o webhook.`
      });
    } catch (error) {
      console.error("Erro ao enviar webhook:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar para o webhook.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-muted-foreground">Carregando dados de marketing...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">
            Gerencie mensagens em massa para seus clientes
          </p>
        </div>

        {/* Filtros */}
        <MarketingFilters
          filters={filters}
          tags={allTags}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Configurações de Mensagem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Configurar Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL do Webhook (n8n)</label>
              <Input
                placeholder="https://seu-webhook.n8n.cloud/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Mensagem para Atribuir</label>
              <Textarea
                placeholder="Digite sua mensagem aqui..."
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAssignMessage} disabled={selectedClients.length === 0}>
                Atribuir Mensagem ({selectedClients.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSendToWebhook}
                disabled={selectedClients.length === 0 || isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Enviando..." : "Enviar para Webhook"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Clientes ({filteredMessages.length} de {messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedClients.length === filteredMessages.length && filteredMessages.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Primeiro Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClients.includes(msg.client_id)}
                        onCheckedChange={(checked) => 
                          handleClientSelection(msg.client_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {msg.client?.name || "Nome não disponível"}
                    </TableCell>
                    <TableCell>{msg.first_name}</TableCell>
                    <TableCell>{msg.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {msg.tags && msg.tags.length > 0 ? (
                          msg.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">Sem tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {msg.message ? (
                          <p className="text-sm truncate" title={msg.message}>
                            {msg.message}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Sem mensagem
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredMessages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  {messages.length === 0 
                    ? "Nenhum cliente encontrado para marketing"
                    : "Nenhum cliente corresponde aos filtros aplicados"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Marketing;
