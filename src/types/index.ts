
export type ClientLevel = 'Lead' | 'Cliente';

export interface Client {
  id: string;
  name: string;
  phone: string;
  source: string;
  level: ClientLevel;
  serviceHistory: ServiceHistory[];
  tasks: Task[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceHistory {
  id: string;
  clientId: string;
  date: Date;
  observations: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  clientId: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}
