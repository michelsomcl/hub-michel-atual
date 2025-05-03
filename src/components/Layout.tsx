
import React from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};
