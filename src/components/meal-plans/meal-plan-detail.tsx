/** @format */

"use client";

import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MealPlanCalendarView } from "./meal-plan-calendar-view";
import { MealPlanListView } from "./meal-plan-list-view";
import { ViewToggle, type ViewMode } from "./view-toggle";
import { CreateMealSlotDialog } from "./create-meal-slot-dialog";
import { SelectRecipesDialog } from "./select-recipes-dialog";
import {
    getDayName,
    DURATION_OPTIONS,
    type DayOfWeek,
    type MealPlanDuration,
} from "@/lib/utils/meal-plan";
import type { MealPlanDetailWithRelations } from "@/hooks/use-meal-plan";
import type { MealSlotWithRelations } from "@/hooks/use-meal-slots";

interface MealPlanDetailProps {
    mealPlan: MealPlanDetailWithRelations;
}

export function MealPlanDetail({ mealPlan }: MealPlanDetailProps) {
    const [view, setView] = useState<ViewMode>("calendar");
    const [createSlotOpen, setCreateSlotOpen] = useState(false);
    const [selectRecipesOpen, setSelectRecipesOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<MealSlotWithRelations | null>(
        null
    );

    const mealSlots = (mealPlan.mealSlots || []) as MealSlotWithRelations[];
    const homeId = mealPlan.home?.id;

    // Get duration label
    const durationLabel =
        DURATION_OPTIONS.find(
            (opt) => opt.value === (mealPlan.duration as MealPlanDuration)
        )?.label || `${mealPlan.duration} Week(s)`;

    // Get start day name
    const startDayName = getDayName(mealPlan.startDayOfWeek as DayOfWeek);

    const handleSlotClick = (slot: MealSlotWithRelations) => {
        setSelectedSlot(slot);
        setSelectRecipesOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">{mealPlan.name}</h1>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{durationLabel}</Badge>
                        <Badge variant="outline">Starts {startDayName}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ViewToggle view={view} onViewChange={setView} />
                </div>
            </div>

            {/* Content */}
            {mealSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
                    <div className="rounded-full bg-primary/10 p-6">
                        <Calendar className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">
                            No Meals or Snacks Yet
                        </h3>
                        <p className="text-muted-foreground mt-1">
                            Start by adding meals and snacks to your meal plan.
                        </p>
                    </div>
                    <Button onClick={() => setCreateSlotOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Meal/Snack
                    </Button>
                </div>
            ) : view === "calendar" ? (
                <MealPlanCalendarView
                    mealSlots={mealSlots}
                    startDayOfWeek={mealPlan.startDayOfWeek as DayOfWeek}
                    duration={mealPlan.duration as MealPlanDuration}
                    onAddSlot={() => setCreateSlotOpen(true)}
                    onSlotClick={handleSlotClick}
                />
            ) : (
                <MealPlanListView
                    mealSlots={mealSlots}
                    startDayOfWeek={mealPlan.startDayOfWeek as DayOfWeek}
                    duration={mealPlan.duration as MealPlanDuration}
                    onAddSlot={() => setCreateSlotOpen(true)}
                    onSlotClick={handleSlotClick}
                />
            )}

            {/* Create Meal Slot Dialog */}
            <CreateMealSlotDialog
                open={createSlotOpen}
                onOpenChange={setCreateSlotOpen}
                mealPlanId={mealPlan.id}
                onSuccess={() => setCreateSlotOpen(false)}
            />

            {/* Select Recipes Dialog */}
            {selectedSlot && homeId && (
                <SelectRecipesDialog
                    open={selectRecipesOpen}
                    onOpenChange={(open) => {
                        setSelectRecipesOpen(open);
                        if (!open) setSelectedSlot(null);
                    }}
                    mealSlot={selectedSlot}
                    homeId={homeId}
                    onSuccess={() => {
                        setSelectRecipesOpen(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
}
