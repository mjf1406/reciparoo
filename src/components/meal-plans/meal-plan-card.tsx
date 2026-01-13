/** @format */

"use client";

import { Calendar, Clock, UtensilsCrossed, Cookie } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealPlanActionMenu } from "./meal-plan-action-menu";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useNavigate } from "@tanstack/react-router";
import {
    getDayName,
    DURATION_OPTIONS,
    type DayOfWeek,
    type MealPlanDuration,
} from "@/lib/utils/meal-plan";
import type { MealPlanWithRelations } from "@/hooks/use-meal-plans";

interface MealPlanCardProps {
    mealPlan: MealPlanWithRelations;
}

export function MealPlanCard({ mealPlan }: MealPlanCardProps) {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const home = mealPlan.home;
    const mealSlots = mealPlan.mealSlots || [];

    // Count meals and snacks
    const mealCount = mealSlots.filter(
        (slot: any) => slot.type === "meal"
    ).length;
    const snackCount = mealSlots.filter(
        (slot: any) => slot.type === "snack"
    ).length;

    // Get duration label
    const durationLabel =
        DURATION_OPTIONS.find(
            (opt) => opt.value === (mealPlan.duration as MealPlanDuration)
        )?.label || `${mealPlan.duration} Week(s)`;

    // Get start day name
    const startDayName = getDayName(mealPlan.startDayOfWeek as DayOfWeek);

    const handleCardClick = () => {
        if (home?.id && mealPlan.id) {
            navigate({
                to: "/home/$homeId/meal-plans/$mealPlanId",
                params: { homeId: home.id, mealPlanId: mealPlan.id },
            });
        }
    };

    return (
        <Card
            className="transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col relative cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Meal Plan Action Menu */}
            <div
                className="absolute top-4 right-4 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <MealPlanActionMenu
                    mealPlan={mealPlan}
                    userId={user?.id}
                />
            </div>

            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <CardTitle className="text-xl line-clamp-1">
                        {mealPlan.name}
                    </CardTitle>
                </div>
                <CardDescription className="flex flex-wrap gap-2 mt-2">
                    <Badge
                        variant="secondary"
                        className="text-xs"
                    >
                        {durationLabel}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="text-xs"
                    >
                        Starts {startDayName}
                    </Badge>
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
                {/* Meal/Snack Counts */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <UtensilsCrossed className="h-4 w-4" />
                        <span>
                            {mealCount} meal{mealCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Cookie className="h-4 w-4" />
                        <span>
                            {snackCount} snack{snackCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Created/Updated Info */}
                <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2">
                    {mealPlan.created && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                                Created:{" "}
                                {new Date(mealPlan.created).toLocaleDateString(
                                    undefined,
                                    {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
