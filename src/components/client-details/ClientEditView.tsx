
import React from "react";
import { Client, Tag } from "../../types";
import { ClientForm } from "../../components/ClientForm";
import { Button } from "@/components/ui/button";

interface ClientEditViewProps {
  client: Client;
  tags: Tag[];
  onSubmit: (client: Client) => Promise<void>;
  onCreateTag: (tag: Tag) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const ClientEditView = ({
  client,
  tags,
  onSubmit,
  onCreateTag,
  onCancel,
  isSaving
}: ClientEditViewProps) => {
  return (
    <>
      <h1 className="text-2xl font-semibold">Editar Cliente</h1>
      
      <ClientForm
        client={client}
        availableTags={tags}
        onSubmit={onSubmit}
        onCreateTag={onCreateTag}
        isLoading={isSaving}
      />
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </>
  );
};
