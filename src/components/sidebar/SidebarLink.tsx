
import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isActive: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon: Icon, 
  children, 
  isActive 
}) => {
  return (
    <li>
      <Link to={to} className={`sidebar-item ${isActive ? "active" : ""}`}>
        <Icon size={20} />
        <span>{children}</span>
      </Link>
    </li>
  );
};
