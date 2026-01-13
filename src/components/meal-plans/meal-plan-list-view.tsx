/** @format */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MealSlotCard } from "./meal-slot-card";
import {
    getOrderedDays,
    getDayName,
    isDaySet,
    sortByTime,
    type DayOfWeek,
    type MealPlanDuration,
} from "@/lib/utils/meal-plan";
import type { MealSlotWithRelations } from "@/hooks/use-meal-slots";

interface MealPlanListViewProps {
    mealSlots: MealSlotWithRelations[];
    startDayOfWeek: DayOfWeek;
    duration: MealPlanDuration;
    onAddSlot: () => void;
    onSlotClick: (mealSlot: MealSlotWithRelations) => void;
}

export function MealPlanListView({
    mealSlots,
    startDayOfWeek,
    duration,
    onAddSlot,
    onSlotClick,
}: MealPlanListViewProps) {
    const orderedDays = getOrderedDays(startDayOfWeek);
    const [expandedDays, setExpandedDays] = useState<Set<DayOfWeek>>(
        new Set(orderedDays)
    );

    // Get slots for a specific day
    const getSlotsForDay = (day: DayOfWeek): MealSlotWithRelations[] => {
        return sortByTime(
            mealSlots.filter((slot) => isDaySet(slot.dayBitmask, day))
        );
    };

    const toggleDay = (day: DayOfWeek) => {
        setExpandedDays((prev) => {
            const next = new Set(prev);
            if (next.has(day)) {
                next.delete(day);
            } else {
                next.add(day);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedDays(new Set(orderedDays));
    };

    const collapseAll = () => {
        setExpandedDays(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={expandAll}>
                        Expand All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={collapseAll}>
                        Collapse All
                    </Button>
                </div>
                <Button onClick={onAddSlot}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meal/Snack
                </Button>
            </div>

            {/* Day List */}
            <div className="space-y-2">
                {orderedDays.map((day) => {
                    const daySlots = getSlotsForDay(day);
                    const isExpanded = expandedDays.has(day);
                    const mealCount = daySlots.filter(
                        (s) => s.type === "meal"
                    ).length;
                    const snackCount = daySlots.filter(
                        (s) => s.type === "snack"
                    ).length;

                    return (
                        <Collapsible
                            key={day}
                            open={isExpanded}
                            onOpenChange={() => toggleDay(day)}
                        >
                            <CollapsibleTrigger
                                render={
                                    <div className="flex items-center justify-between w-full p-4 bg-card border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            <span className="font-semibold">
                                                {getDayName(day)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            {mealCount > 0 && (
                                                <span>
                                                    {mealCount} meal
                                                    {mealCount !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                            {snackCount > 0 && (
                                                <span>
                                                    {snackCount} snack
                                                    {snackCount !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                            {daySlots.length === 0 && (
                                                <span>No meals/snacks</span>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                            <CollapsibleContent>
                                <div className="pl-8 pr-4 py-3 space-y-3">
                                    {daySlots.length === 0 ? (
                                        <div className="text-sm text-muted-foreground py-4 text-center">
                                            No meals or snacks scheduled for
                                            this day.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {daySlots.map((slot) => (
                                                <MealSlotCard
                                                    key={slot.id}
                                                    mealSlot={slot}
                                                    onClick={() =>
                                                        onSlotClick(slot)
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Info about duration */}
            {duration > 1 && (
                <p className="text-sm text-muted-foreground text-center">
                    This meal plan repeats over {duration} week
                    {duration > 1 ? "s" : ""}.
                </p>
            )}
        </div>
    );
}
