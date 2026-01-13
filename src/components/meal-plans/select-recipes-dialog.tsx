/** @format */

"use client";

import { useState, useMemo } from "react";
import { Search, UtensilsCrossed, Cookie } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { RecipeGridItem } from "./recipe-grid-item";
import { formatTime12 } from "@/lib/utils/meal-plan";
import type { MealSlotWithRelations } from "@/hooks/use-meal-slots";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type RecipeBasic = InstaQLEntity<AppSchema, "recipes">;

interface SelectRecipesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mealSlot: MealSlotWithRelations;
    homeId: string;
    onSuccess?: () => void;
}

export function SelectRecipesDialog({
    open,
    onOpenChange,
    mealSlot,
    homeId,
    onSuccess,
}: SelectRecipesDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
        new Set(
            mealSlot.mealSlotRecipes
                ?.map((msr: any) => msr.recipe?.id)
                .filter(Boolean) || []
        )
    );
    const [isLoading, setIsLoading] = useState(false);

    // Query all recipes for this home
    const { data: recipesData } = db.useQuery({
        recipes: {
            $: {
                where: {
                    "home.id": homeId,
                },
            },
        },
    });

    const recipes = (recipesData?.recipes || []) as unknown as RecipeBasic[];

    // Filter recipes by search query
    const filteredRecipes = useMemo(() => {
        if (!searchQuery.trim()) return recipes;
        const query = searchQuery.toLowerCase();
        return recipes.filter((recipe) =>
            recipe.name.toLowerCase().includes(query)
        );
    }, [recipes, searchQuery]);

    // Get currently assigned recipe IDs
    const currentRecipeIds = useMemo(() => {
        return new Set(
            mealSlot.mealSlotRecipes
                ?.map((msr: any) => msr.recipe?.id)
                .filter(Boolean) || []
        );
    }, [mealSlot]);

    // Reset selection when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setSelectedRecipeIds(new Set(currentRecipeIds));
            setSearchQuery("");
        }
        onOpenChange(isOpen);
    };

    const toggleRecipe = (recipeId: string) => {
        setSelectedRecipeIds((prev) => {
            const next = new Set(prev);
            if (next.has(recipeId)) {
                next.delete(recipeId);
            } else {
                next.add(recipeId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const transactions: any[] = [];

            // Get existing mealSlotRecipes for this slot
            const existingRecipeToMsr = new Map(
                mealSlot.mealSlotRecipes?.map((msr: any) => [
                    msr.recipe?.id,
                    msr.id,
                ]) || []
            );

            // Find recipes to add (selected but not currently assigned)
            const recipesToAdd = [...selectedRecipeIds].filter(
                (id) => !currentRecipeIds.has(id)
            );

            // Find recipes to remove (currently assigned but not selected)
            const recipesToRemove = [...currentRecipeIds].filter(
                (id) => !selectedRecipeIds.has(id)
            );

            // Create new mealSlotRecipes
            for (let i = 0; i < recipesToAdd.length; i++) {
                const recipeId = recipesToAdd[i];
                const msrId = id();
                transactions.push(
                    db.tx.mealSlotRecipes[msrId]
                        .create({
                            order: i,
                            created: new Date(),
                        })
                        .link({ mealSlot: mealSlot.id })
                        .link({ recipe: recipeId })
                );
            }

            // Delete mealSlotRecipes that are no longer needed
            for (const recipeId of recipesToRemove) {
                const msrId = existingRecipeToMsr.get(recipeId);
                if (msrId) {
                    transactions.push(db.tx.mealSlotRecipes[msrId].delete());
                }
            }

            if (transactions.length > 0) {
                db.transact(transactions);
                // Wait a moment for the transaction to complete
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating recipes:", error);
            alert("Failed to update recipes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isMeal = mealSlot.type === "meal";
    const Icon = isMeal ? UtensilsCrossed : Cookie;
    const timeDisplay = formatTime12(mealSlot.time);

    return (
        <Credenza
            open={open}
            onOpenChange={handleOpenChange}
        >
            <CredenzaContent className="max-w-4xl">
                <CredenzaHeader>
                    <CredenzaTitle className="flex items-center gap-2">
                        <Icon
                            className={`h-5 w-5 ${
                                isMeal ? "text-primary" : "text-amber-500"
                            }`}
                        />
                        Select Recipes for {mealSlot.name}
                    </CredenzaTitle>
                    <CredenzaDescription className="flex items-center gap-2">
                        <Badge variant={isMeal ? "default" : "secondary"}>
                            {isMeal ? "Meal" : "Snack"}
                        </Badge>
                        <Badge variant="outline">{timeDisplay}</Badge>
                        <span>
                            {selectedRecipeIds.size} recipe
                            {selectedRecipeIds.size !== 1 ? "s" : ""} selected
                        </span>
                    </CredenzaDescription>
                </CredenzaHeader>
                <CredenzaBody>
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search recipes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Recipe Grid */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {filteredRecipes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {recipes.length === 0
                                        ? "No recipes in this home yet. Create some recipes first!"
                                        : "No recipes match your search."}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {filteredRecipes.map((recipe) => (
                                        <RecipeGridItem
                                            key={recipe.id}
                                            recipe={recipe}
                                            selected={selectedRecipeIds.has(
                                                recipe.id
                                            )}
                                            onToggle={() =>
                                                toggleRecipe(recipe.id)
                                            }
                                        />
                                    ))}
                                </div>
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
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Recipes"}
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}
