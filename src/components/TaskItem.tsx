
import React from "react";
import { Task } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "../lib/utils";

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string, completed: boolean) => void;
}

export const TaskItem = ({ task, onComplete }: TaskItemProps) => {
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-b-0">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onComplete(task.id, checked === true)}
      />
      
      <div className="flex-1 space-y-1">
        <p className={`${task.completed ? "line-through text-muted-foreground" : ""}`}>
          {task.description}
        </p>
        
        {task.dueDate && (
          <div className="flex items-center text-sm">
            <span className={`${
              task.completed 
                ? "text-muted-foreground" 
                : new Date(task.dueDate) < new Date() 
                  ? "text-red-500" 
                  : "text-muted-foreground"
            }`}>
              Prazo: {formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Criado: {formatDate(task.createdAt)}
      </div>
    </div>
  );
};
