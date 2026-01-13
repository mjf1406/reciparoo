/** @format */

"use client";

import { UtensilsCrossed, Cookie, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealSlotActionMenu } from "./meal-slot-action-menu";
import { useAuthContext } from "@/components/auth/auth-provider";
import {
    formatTime12,
    getSetDays,
    getDayNameShort,
} from "@/lib/utils/meal-plan";
import type { MealSlotWithRelations } from "@/hooks/use-meal-slots";

interface MealSlotCardProps {
    mealSlot: MealSlotWithRelations;
    onClick?: () => void;
    compact?: boolean;
}

export function MealSlotCard({
    mealSlot,
    onClick,
    compact = false,
}: MealSlotCardProps) {
    const { user } = useAuthContext();

    const isMeal = mealSlot.type === "meal";
    const Icon = isMeal ? UtensilsCrossed : Cookie;
    const recipes = mealSlot.mealSlotRecipes || [];

    // Get first 4 recipes with images for the preview grid
    const recipesWithImages = recipes
        .map((msr: any) => msr.recipe)
        .filter((r: any) => r?.imageURL)
        .slice(0, 4);

    // Get the single day for this slot (should only be one day now)
    const setDays = getSetDays(mealSlot.dayBitmask);
    const dayName = setDays.length > 0 ? getDayNameShort(setDays[0]) : "Unknown";
    const timeDisplay = formatTime12(mealSlot.time);

    if (compact) {
        return (
            <Card
                className={`transition-all hover:shadow-md cursor-pointer ${
                    isMeal
                        ? "border-l-4 border-l-primary"
                        : "border-l-4 border-l-amber-500"
                }`}
                onClick={onClick}
            >
                <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon
                                className={`h-8 w-8 ${
                                    isMeal ? "text-primary" : "text-amber-500"
                                }`}
                            />
                            <div>
                                <span className="font-medium text-sm">
                                    {mealSlot.name}
                                </span>
                                <Badge
                                    variant={isMeal ? "outline" : "outline"}
                                    className="text-xs"
                                >
                                    {timeDisplay}
                                </Badge>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {recipes.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {recipes.length} recipe
                                    {recipes.length !== 1 ? "s" : ""}
                                </span>
                            )}
                            <MealSlotActionMenu
                                mealSlot={mealSlot}
                                userId={user?.id}
                            />
                        </div>
                    </div>
                    {recipesWithImages.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {recipesWithImages.map((recipe: any) => (
                                <div
                                    key={recipe.id}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={recipe.imageURL}
                                            alt={recipe.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span
                                        className="text-[10px] text-muted-foreground truncate max-w-[60px] text-center"
                                        title={recipe.name}
                                    >
                                        {recipe.name || "Untitled"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={`transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                isMeal
                    ? "border-l-4 border-l-primary"
                    : "border-l-4 border-l-amber-500"
            }`}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Icon
                                className={`h-5 w-5 flex-shrink-0 ${
                                    isMeal ? "text-primary" : "text-amber-500"
                                }`}
                            />
                            <CardTitle className="text-lg break-words">
                                {mealSlot.name}
                            </CardTitle>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant={isMeal ? "default" : "secondary"}>
                                {isMeal ? "Meal" : "Snack"}
                            </Badge>
                            <Badge variant="outline">{timeDisplay}</Badge>
                        </div>
                    </div>
                    <div
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MealSlotActionMenu
                            mealSlot={mealSlot}
                            userId={user?.id}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Day */}
                <div className="text-xs text-muted-foreground">
                    {dayName}
                </div>

                {/* Recipe Preview Grid */}
                <div className="w-full bg-muted/30 rounded-lg overflow-hidden">
                    {recipesWithImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1 p-1">
                            {recipesWithImages.map((recipe: any) => (
                                <div
                                    key={recipe.id}
                                    className="flex flex-col overflow-hidden"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-muted rounded">
                                        <img
                                            src={recipe.imageURL}
                                            alt={recipe.name || "Recipe"}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                    <span
                                        className="text-[10px] text-muted-foreground truncate mt-0.5 px-0.5"
                                        title={recipe.name}
                                    >
                                        {recipe.name || "Untitled"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                            <span className="text-xs">
                                Click to add recipes
                            </span>
                        </div>
                    )}
                </div>

                {/* Recipe Count */}
                <div className="text-xs text-muted-foreground text-center">
                    {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}{" "}
                    assigned
                </div>
            </CardContent>
        </Card>
    );
}
