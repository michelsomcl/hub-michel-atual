
import { Client, Tag } from "../types";

// First define tags so we can associate them with clients
export const mockTags: Tag[] = [
  {
    id: "1",
    name: "VIP",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Ativo",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Inativo",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Aposentado",
    createdAt: new Date(),
  },
];

export const mockClients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    phone: "(11) 99999-9999",
    source: "Google",
    level: "Lead",
    serviceHistory: [],
    tasks: [],
    tags: [mockTags[0], mockTags[1]], // Adding some tags to clients
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Maria Oliveira",
    phone: "(21) 98888-8888",
    source: "Indicação",
    level: "Cliente",
    serviceHistory: [],
    tasks: [],
    tags: [mockTags[1]], 
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Carlos Pereira",
    phone: "(31) 97777-7777",
    source: "Facebook",
    level: "Lead",
    serviceHistory: [],
    tasks: [],
    tags: [mockTags[2]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Ana Souza",
    phone: "(41) 96666-6666",
    source: "Instagram",
    level: "Cliente",
    serviceHistory: [],
    tasks: [],
    tags: [mockTags[0], mockTags[3]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Ricardo Rocha",
    phone: "(51) 95555-5555",
    source: "LinkedIn",
    level: "Lead",
    serviceHistory: [],
    tasks: [],
    tags: [mockTags[3]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
