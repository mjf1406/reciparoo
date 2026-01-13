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
import type { MealPlanWithRelations } from "@/hooks/use-meal-plans";

interface EditMealPlanDialogProps {
    mealPlan: MealPlanWithRelations;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditMealPlanDialog({
    mealPlan,
    open,
    onOpenChange,
    onSuccess,
}: EditMealPlanDialogProps) {
    const [name, setName] = useState(mealPlan.name);
    const [duration, setDuration] = useState<MealPlanDuration>(
        mealPlan.duration as MealPlanDuration
    );
    const [startDayOfWeek, setStartDayOfWeek] = useState<DayOfWeek>(
        mealPlan.startDayOfWeek as DayOfWeek
    );
    const [isLoading, setIsLoading] = useState(false);

    // Update form when mealPlan changes
    useEffect(() => {
        setName(mealPlan.name);
        setDuration(mealPlan.duration as MealPlanDuration);
        setStartDayOfWeek(mealPlan.startDayOfWeek as DayOfWeek);
    }, [mealPlan]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const now = new Date();

            db.transact(
                db.tx.mealPlans[mealPlan.id].update({
                    name: name.trim(),
                    duration,
                    startDayOfWeek,
                    updated: now,
                })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating meal plan:", error);
            alert("Failed to update meal plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Edit Meal Plan</CredenzaTitle>
                        <CredenzaDescription>
                            Update your meal plan settings.
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
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
