/** @format */

"use client";

import { Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "calendar" | "list";

interface ViewToggleProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
                variant={view === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("calendar")}
                className="gap-2"
            >
                <Calendar className="h-4 w-4" />
                Calendar
            </Button>
            <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("list")}
                className="gap-2"
            >
                <List className="h-4 w-4" />
                List
            </Button>
        </div>
    );
}
