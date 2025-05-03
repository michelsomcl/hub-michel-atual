
import React from "react";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarFooter } from "./sidebar/SidebarFooter";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-blue h-full flex flex-col">
      <SidebarHeader />
      <SidebarNavigation />
      <SidebarFooter />
    </aside>
  );
};
