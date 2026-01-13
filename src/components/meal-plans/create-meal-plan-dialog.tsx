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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DURATION_OPTIONS,
    START_DAY_OPTIONS,
    type DayOfWeek,
    type MealPlanDuration,
} from "@/lib/utils/meal-plan";

interface CreateMealPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    homeId: string;
    onSuccess?: () => void;
}

export function CreateMealPlanDialog({
    open,
    onOpenChange,
    homeId,
    onSuccess,
}: CreateMealPlanDialogProps) {
    const [name, setName] = useState("");
    const [duration, setDuration] = useState<MealPlanDuration>(1);
    const [startDayOfWeek, setStartDayOfWeek] = useState<DayOfWeek>(1); // Default to Monday
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const mealPlanId = id();
            const now = new Date();

            db.transact(
                db.tx.mealPlans[mealPlanId]
                    .create({
                        name: name.trim(),
                        duration,
                        startDayOfWeek,
                        created: now,
                        updated: now,
                    })
                    .link({ home: homeId })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Reset form and close dialog
            setName("");
            setDuration(1);
            setStartDayOfWeek(1);
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error creating meal plan:", error);
            alert("Failed to create meal plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Create a New Meal Plan</CredenzaTitle>
                        <CredenzaDescription>
                            Set up your meal plan with a name, duration, and
                            starting day of the week.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Meal Plan Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Weekly Family Meals"
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration *</Label>
                                <Select
                                    value={duration.toString()}
                                    onValueChange={(value) =>
                                        value &&
                                        setDuration(
                                            parseInt(value) as MealPlanDuration
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DURATION_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value.toString()}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDay">
                                    Week Starts On *
                                </Label>
                                <Select
                                    value={startDayOfWeek.toString()}
                                    onValueChange={(value) =>
                                        value &&
                                        setStartDayOfWeek(
                                            parseInt(value) as DayOfWeek
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {START_DAY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value.toString()}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            {isLoading ? "Creating..." : "Create Meal Plan"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
