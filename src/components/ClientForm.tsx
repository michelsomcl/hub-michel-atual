
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, ClientLevel, Tag } from "../types";
import { TagsInput } from "./TagsInput";
import { QuickTagModal } from "./QuickTagModal";
import { generateId } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
  client?: Client;
  availableTags: Tag[];
  onSubmit: (client: Client) => void;
  onCreateTag: (tag: Tag) => void;
}

export const ClientForm = ({ client, availableTags, onSubmit, onCreateTag }: ClientFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(client?.name || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [source, setSource] = useState(client?.source || "");
  const [level, setLevel] = useState<ClientLevel>(client?.level || "Lead");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(client?.tags || []);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Ensure that selectedTags is updated when client.tags changes
  useEffect(() => {
    if (client?.tags) {
      setSelectedTags(client.tags);
    }
  }, [client?.tags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !source.trim()) {
      toast({
        title: "Campos inválidos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedClient: Client = {
      id: client?.id || generateId(),
      name: name.trim(),
      phone: phone.trim(),
      source: source.trim(),
      level,
      serviceHistory: client?.serviceHistory || [],
      tasks: client?.tasks || [],
      tags: selectedTags,
      createdAt: client?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSubmit(updatedClient);
    
    if (!client) {
      // Reset form if it's a new client
      setName("");
      setPhone("");
      setSource("");
      setLevel("Lead");
      setSelectedTags([]);
      
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi cadastrado com sucesso."
      });
    } else {
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas."
      });
    }
  };
  
  const handleCreateTag = (tag: Tag) => {
    onCreateTag(tag);
    setSelectedTags(prev => [...prev, tag]);
    
    toast({
      title: "Tag criada",
      description: `A tag "${tag.name}" foi criada com sucesso.`
    });
  };
  
  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="required">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="required">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="source" className="required">Fonte</Label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Como conheceu o serviço?"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="level">Nível do Cliente</Label>
            <Select value={level} onValueChange={(value) => setLevel(value as ClientLevel)}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Tags</Label>
            <TagsInput
              selectedTags={selectedTags}
              availableTags={availableTags}
              onChange={handleTagsChange}
              onAddTagClick={() => setIsTagModalOpen(true)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button type="submit" className="btn-primary">
            {client ? "Atualizar" : "Cadastrar"} Cliente
          </Button>
        </div>
      </form>
      
      <QuickTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onCreateTag={handleCreateTag}
      />
    </>
  );
};
