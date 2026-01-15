/** @format */

"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface MealPlanCalendarViewProps {
    mealSlots: MealSlotWithRelations[];
    startDayOfWeek: DayOfWeek;
    duration: MealPlanDuration;
    onAddSlot: () => void;
    onSlotClick: (mealSlot: MealSlotWithRelations) => void;
}

export function MealPlanCalendarView({
    mealSlots,
    startDayOfWeek,
    duration,
    onAddSlot,
    onSlotClick,
}: MealPlanCalendarViewProps) {
    const orderedDays = getOrderedDays(startDayOfWeek);

    // Get slots for a specific day
    const getSlotsForDay = (day: DayOfWeek): MealSlotWithRelations[] => {
        return sortByTime(
            mealSlots.filter((slot) => isDaySet(slot.dayBitmask, day))
        );
    };

    const currentDate = new Date();
    const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
    });
    const dateString = currentDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="space-y-4">
            {/* Add Slot Button */}
            <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">
                    {dayName}, {dateString}
                </div>
                <Button onClick={onAddSlot}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meal/Snack
                </Button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
                {orderedDays.map((day) => {
                    const daySlots = getSlotsForDay(day);
                    // Get current day of week (0 = Sunday, 6 = Saturday)
                    const currentDayOfWeek = new Date().getDay() as DayOfWeek;
                    const isCurrentDay = day === currentDayOfWeek;

                    return (
                        <Card
                            key={day}
                            className={`min-h-[300px] ${!isCurrentDay ? "opacity-60" : ""}`}
                        >
                            <CardHeader className="py-3 px-3">
                                <CardTitle className="text-sm font-medium text-center">
                                    {getDayName(day)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2 pb-2 space-y-2">
                                {daySlots.length === 0 ? (
                                    <div className="flex items-center justify-center h-24 text-muted-foreground text-xs text-center">
                                        No meals/snacks
                                    </div>
                                ) : (
                                    daySlots.map((slot) => (
                                        <MealSlotCard
                                            key={slot.id}
                                            mealSlot={slot}
                                            compact
                                            onClick={() => onSlotClick(slot)}
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
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
