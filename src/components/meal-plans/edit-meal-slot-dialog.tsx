/** @format */

"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { db } from "@/lib/db/db";
import {
    Credenza,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
    DAY_NAMES,
    createBitmask,
    getSetDays,
    type DayOfWeek,
    type MealSlotType,
} from "@/lib/utils/meal-plan";
import type { MealSlotWithRelations } from "@/hooks/use-meal-slots";

interface EditMealSlotDialogProps {
    mealSlot: MealSlotWithRelations;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditMealSlotDialog({
    mealSlot,
    open,
    onOpenChange,
    onSuccess,
}: EditMealSlotDialogProps) {
    const [name, setName] = useState(mealSlot.name);
    const [type, setType] = useState<MealSlotType>(
        mealSlot.type as MealSlotType
    );
    const [time, setTime] = useState(mealSlot.time);
    // Since each slot now represents a single day, get the first (and only) day
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
        getSetDays(mealSlot.dayBitmask)[0] || 0
    );
    const [isLoading, setIsLoading] = useState(false);

    // Update form when mealSlot changes
    useEffect(() => {
        setName(mealSlot.name);
        setType(mealSlot.type as MealSlotType);
        setTime(mealSlot.time);
        const days = getSetDays(mealSlot.dayBitmask);
        setSelectedDay(days[0] || 0);
    }, [mealSlot]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const now = new Date();
            const dayBitmask = createBitmask([selectedDay]);

            db.transact(
                db.tx.mealSlots[mealSlot.id].update({
                    name: name.trim(),
                    type,
                    time,
                    dayBitmask,
                    updated: now,
                })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating meal slot:", error);
            alert("Failed to update meal slot. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Edit Meal/Snack</CredenzaTitle>
                        <CredenzaDescription>
                            Update the meal or snack settings. Each slot
                            represents a single day. To add this slot to other
                            days, create a new slot.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Breakfast, Lunch, Brunch"
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Type *</Label>
                                <RadioGroup
                                    value={type}
                                    onValueChange={(value) =>
                                        setType(value as MealSlotType)
                                    }
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-lg border border-input bg-background p-1",
                                        isLoading && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <label
                                        htmlFor="type-meal"
                                        className={cn(
                                            "relative flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                                            type === "meal"
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <RadioGroupItem
                                            value="meal"
                                            id="type-meal"
                                            className="sr-only"
                                        />
                                        Meal
                                    </label>
                                    <label
                                        htmlFor="type-snack"
                                        className={cn(
                                            "relative flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                                            type === "snack"
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <RadioGroupItem
                                            value="snack"
                                            id="type-snack"
                                            className="sr-only"
                                        />
                                        Snack
                                    </label>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time">Time *</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Day *</Label>
                                <RadioGroup
                                    value={selectedDay.toString()}
                                    onValueChange={(value) =>
                                        setSelectedDay(
                                            parseInt(value, 10) as DayOfWeek
                                        )
                                    }
                                    className={cn(
                                        "grid grid-cols-4 gap-2",
                                        isLoading && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    {DAY_NAMES.map((day, index) => (
                                        <div
                                            key={day}
                                            className="flex items-center space-x-2"
                                        >
                                            <RadioGroupItem
                                                value={index.toString()}
                                                id={`day-${index}`}
                                                className="mt-0"
                                                disabled={isLoading}
                                            />
                                            <Label
                                                htmlFor={`day-${index}`}
                                                className={cn(
                                                    "text-sm cursor-pointer",
                                                    isLoading && "cursor-not-allowed"
                                                )}
                                            >
                                                {day.slice(0, 3)}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    </CredenzaBody>
                    <CredenzaFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
