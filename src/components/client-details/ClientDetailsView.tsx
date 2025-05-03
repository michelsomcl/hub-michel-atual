
import React from "react";
import { Client, ServiceHistory, Task, Tag } from "../../types";
import { ClientDetails as ClientDetailsComponent } from "../ClientDetails";

interface ClientDetailsViewProps {
  client: Client;
  availableTags: Tag[];
  onServiceHistoryAdd: (history: ServiceHistory) => Promise<void>;
  onTaskAdd: (task: Task) => Promise<void>;
  onTaskComplete: (taskId: string, completed: boolean) => Promise<void>;
  onEditClick: () => void;
  isSaving: boolean;
}

export const ClientDetailsView = ({
  client,
  availableTags,
  onServiceHistoryAdd,
  onTaskAdd,
  onTaskComplete,
  onEditClick,
  isSaving
}: ClientDetailsViewProps) => {
  return (
    <ClientDetailsComponent
      client={client}
      availableTags={availableTags}
      onServiceHistoryAdd={onServiceHistoryAdd}
      onTaskAdd={onTaskAdd}
      onTaskComplete={onTaskComplete}
      onEditClick={onEditClick}
      isSaving={isSaving}
    />
  );
};
