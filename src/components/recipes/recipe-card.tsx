/** @format */

"use client";

import { Clock, Utensils, ExternalLink } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { RecipeActionMenu } from "./recipe-action-menu";
import { useNavigate } from "@tanstack/react-router";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";
import { getRecipeImageUrl } from "@/lib/utils/recipe-image";
import { parseMealComponents } from "@/lib/utils/recipe-meal";

type RecipeWithRelations = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        folder: {};
        imageFile: {};
    }
>;

interface RecipeCardProps {
    recipe: RecipeWithRelations | any;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: (recipeId: string) => void;
}

export function RecipeCard({
    recipe,
    selectable = false,
    selected = false,
    onToggleSelect,
}: RecipeCardProps) {
    const navigate = useNavigate();
    const imageUrl = getRecipeImageUrl(recipe);

    const ingredients = recipe.ingredients
        ? (JSON.parse(recipe.ingredients) as Array<{
              quantity: string;
              unit: string;
              name: string;
          }>)
        : [];
    const equipment = recipe.equipment
        ? (JSON.parse(recipe.equipment) as string[])
        : [];

    const dietTypes = recipe.diet
        ? recipe.diet.split(",").map((d: string) => d.trim())
        : [];

    const componentCount = recipe.isMeal
        ? parseMealComponents(recipe.components).length
        : 0;

    const formatTime = (minutes?: number) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const prepTime = formatTime(recipe.prepTime);
    const cookTime = formatTime(recipe.cookTime);

    const handleCardClick = () => {
        if (selectable && onToggleSelect && recipe.id) {
            onToggleSelect(recipe.id);
            return;
        }

        if (recipe.id) {
            navigate({
                to: "/$recipeId",
                params: { recipeId: recipe.id },
            });
        }
    };

    return (
        <Card
            className={`transition-all flex flex-col relative cursor-pointer ${
                selectable
                    ? selected
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    : "hover:shadow-lg hover:scale-[1.02]"
            }`}
            onClick={handleCardClick}
        >
            {selectable && (
                <div
                    className="absolute top-4 left-4 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={selected}
                        onCheckedChange={() =>
                            recipe.id && onToggleSelect?.(recipe.id)
                        }
                        aria-label={`Select ${recipe.name}`}
                    />
                </div>
            )}

            {!selectable && (
                <>
                    {imageUrl ? (
                        <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                            <ImageSkeleton
                                src={imageUrl}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                                aspectRatio="16/9"
                            />
                            <div
                                className="absolute top-4 right-4 z-10 flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {recipe.isMeal && (
                                    <Badge variant="default" className="shrink-0">
                                        Meal
                                    </Badge>
                                )}
                                <RecipeActionMenu recipe={recipe} />
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-end gap-2 px-4 pt-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {recipe.isMeal && (
                                <Badge variant="default" className="shrink-0">
                                    Meal
                                </Badge>
                            )}
                            <RecipeActionMenu recipe={recipe} />
                        </div>
                    )}
                </>
            )}

            {imageUrl && selectable && (
                <div className="w-full h-48 overflow-hidden rounded-t-xl">
                    <ImageSkeleton
                        src={imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        aspectRatio="16/9"
                    />
                </div>
            )}

            <CardHeader className={!selectable && !imageUrl ? "pt-0" : undefined}>
                <CardTitle className="text-xl line-clamp-2">
                    {recipe.name}
                </CardTitle>
                {recipe.description && (
                    <CardDescription className="mt-2 line-clamp-3">
                        {recipe.description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
                {recipe.isMeal && componentCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Combined from {componentCount} recipe
                        {componentCount !== 1 ? "s" : ""}
                    </p>
                )}

                {dietTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {dietTypes.map((diet: string, index: number) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                            >
                                {diet}
                            </Badge>
                        ))}
                    </div>
                )}

                {(prepTime || cookTime) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {prepTime && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Prep: {prepTime}</span>
                            </div>
                        )}
                        {cookTime && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Cook: {cookTime}</span>
                            </div>
                        )}
                    </div>
                )}

                {!recipe.isMeal && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {ingredients.length > 0 && (
                            <div className="flex items-center gap-1">
                                <Utensils className="h-4 w-4" />
                                <span>
                                    {ingredients.length} ingredient
                                    {ingredients.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}
                        {equipment.length > 0 && (
                            <div className="text-xs">
                                {equipment.length} piece
                                {equipment.length !== 1 ? "s" : ""} of equipment
                            </div>
                        )}
                    </div>
                )}

                {recipe.source && (
                    <a
                        href={recipe.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3 w-3" />
                        <span>View Source</span>
                    </a>
                )}
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-1 text-xs text-muted-foreground pt-2">
                {recipe.created && (
                    <div>
                        Created:{" "}
                        {new Date(recipe.created).toLocaleDateString(
                            undefined,
                            {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </div>
                )}
                {recipe.updated && (
                    <div>
                        Updated:{" "}
                        {new Date(recipe.updated).toLocaleDateString(
                            undefined,
                            {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
