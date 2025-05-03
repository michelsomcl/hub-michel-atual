
import React from "react";
import { useLocation } from "react-router-dom";
import { Users, Tag, BarChartBig, Calendar, ListChecks } from "lucide-react";
import { SidebarLink } from "./SidebarLink";

export const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="flex-1 px-4 py-2">
      <ul className="space-y-2">
        <SidebarLink to="/" icon={BarChartBig} isActive={isActive("/")}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/clients" icon={Users} isActive={isActive("/clients")}>
          Clientes
        </SidebarLink>
        <SidebarLink to="/tags" icon={Tag} isActive={isActive("/tags")}>
          Tags
        </SidebarLink>
        <SidebarLink to="/calendar" icon={Calendar} isActive={isActive("/calendar")}>
          Calendário
        </SidebarLink>
        <SidebarLink to="/tasks" icon={ListChecks} isActive={isActive("/tasks")}>
          Tarefas
        </SidebarLink>
      </ul>
    </nav>
  );
};
