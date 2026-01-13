/** @format */

"use client";

import { Calendar, Plus } from "lucide-react";
import { MealPlanCard } from "./meal-plan-card";
import { Button } from "@/components/ui/button";
import type { MealPlanWithRelations } from "@/hooks/use-meal-plans";

interface MealPlansGridProps {
    mealPlans: MealPlanWithRelations[];
    onCreateClick: () => void;
}

export function MealPlansGrid({ mealPlans, onCreateClick }: MealPlansGridProps) {
    if (mealPlans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
                <div className="rounded-full bg-primary/10 p-6">
                    <Calendar className="h-12 w-12 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">No Meal Plans Yet</h3>
                    <p className="text-muted-foreground mt-1">
                        Create your first meal plan to start organizing your
                        meals and snacks.
                    </p>
                </div>
                <Button onClick={onCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Meal Plan
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((mealPlan) => (
                <MealPlanCard key={mealPlan.id} mealPlan={mealPlan} />
            ))}
        </div>
    );
}
