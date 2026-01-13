/** @format */

"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { id } from "@instantdb/react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
    DAY_NAMES,
    createBitmask,
    type DayOfWeek,
    type MealSlotType,
} from "@/lib/utils/meal-plan";

interface CreateMealSlotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mealPlanId: string;
    onSuccess?: () => void;
}

export function CreateMealSlotDialog({
    open,
    onOpenChange,
    mealPlanId,
    onSuccess,
}: CreateMealSlotDialogProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<MealSlotType>("meal");
    const [time, setTime] = useState("12:00");
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([
        0, 1, 2, 3, 4, 5, 6,
    ]); // All days by default
    const [isLoading, setIsLoading] = useState(false);

    const handleDayToggle = (day: DayOfWeek) => {
        setSelectedDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day].sort((a, b) => a - b)
        );
    };

    const handleSelectAll = () => {
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    };

    const handleSelectWeekdays = () => {
        setSelectedDays([1, 2, 3, 4, 5]);
    };

    const handleSelectWeekends = () => {
        setSelectedDays([0, 6]);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim() || selectedDays.length === 0) return;

        setIsLoading(true);
        try {
            const now = new Date();
            const transactions: any[] = [];

            // Create a separate slot for each selected day
            for (const day of selectedDays) {
                const mealSlotId = id();
                // Create a bitmask with only this day set
                const dayBitmask = createBitmask([day]);

                transactions.push(
                    db.tx.mealSlots[mealSlotId]
                        .create({
                            name: name.trim(),
                            type,
                            time,
                            dayBitmask,
                            created: now,
                            updated: now,
                        })
                        .link({ mealPlan: mealPlanId })
                );
            }

            db.transact(transactions);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Reset form and close dialog
            setName("");
            setType("meal");
            setTime("12:00");
            setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error creating meal slots:", error);
            alert("Failed to create meal slots. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Add Meal or Snack</CredenzaTitle>
                        <CredenzaDescription>
                            Create separate meal or snack slots for each selected
                            day. Each day will have its own slot that you can
                            customize independently.
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
                                    className={`inline-flex items-center gap-1 rounded-lg border border-input bg-background p-1 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
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
                                <div className="flex items-center justify-between">
                                    <Label>Days *</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectAll}
                                            disabled={isLoading}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectWeekdays}
                                            disabled={isLoading}
                                        >
                                            Weekdays
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSelectWeekends}
                                            disabled={isLoading}
                                        >
                                            Weekends
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {DAY_NAMES.map((day, index) => (
                                        <div
                                            key={day}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`day-${index}`}
                                                checked={selectedDays.includes(
                                                    index as DayOfWeek
                                                )}
                                                onCheckedChange={() =>
                                                    handleDayToggle(
                                                        index as DayOfWeek
                                                    )
                                                }
                                                disabled={isLoading}
                                            />
                                            <Label
                                                htmlFor={`day-${index}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {day.slice(0, 3)}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {selectedDays.length === 0 && (
                                    <p className="text-sm text-destructive">
                                        Please select at least one day.
                                    </p>
                                )}
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
                            disabled={
                                isLoading ||
                                !name.trim() ||
                                selectedDays.length === 0
                            }
                        >
                            {isLoading
                                ? "Creating..."
                                : `Add Meal/Snack${selectedDays.length > 1 ? ` (${selectedDays.length} slots)` : ""}`}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
