
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceHistory } from "../types";
import { generateId } from "../lib/utils";

interface ServiceHistoryFormProps {
  clientId: string;
  onSubmit: (history: ServiceHistory) => void;
}

export const ServiceHistoryForm = ({ clientId, onSubmit }: ServiceHistoryFormProps) => {
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [observations, setObservations] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!observations.trim()) return;
    
    const newHistory: ServiceHistory = {
      id: generateId(),
      clientId,
      date: new Date(date),
      observations,
      createdAt: new Date(),
    };
    
    onSubmit(newHistory);
    setObservations("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Data do Atendimento</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Detalhes do atendimento..."
          rows={4}
          required
        />
      </div>
      
      <Button type="submit" className="btn-primary">
        Registrar Atendimento
      </Button>
    </form>
  );
};
