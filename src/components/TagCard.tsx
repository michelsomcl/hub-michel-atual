
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tag } from "../types";
import { formatDate } from "../lib/utils";

interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
}

export const TagCard = ({ tag, onEdit, onDelete }: TagCardProps) => {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className="text-sm py-1 px-3">
            {tag.name}
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(tag)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(tag.id)}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Criada em: {formatDate(tag.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
};
