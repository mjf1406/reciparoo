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
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { RecipeActionMenu } from "./recipe-action-menu";
import { useAuthContext } from "@/components/auth/auth-provider";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type RecipeWithRelations = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
        };
    }
>;

interface RecipeCardProps {
    recipe: RecipeWithRelations | any; // Allow flexible type for Date objects
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    const { user } = useAuthContext();

    // Parse ingredients and equipment from JSON strings
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

    // Parse diet types from comma-separated string
    const dietTypes = recipe.diet
        ? recipe.diet.split(",").map((d: string) => d.trim())
        : [];

    // Format time display
    const formatTime = (minutes?: number) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const prepTime = formatTime(recipe.prepTime);
    const cookTime = formatTime(recipe.cookTime);

    return (
        <Card className="transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col relative">
            {/* Recipe Action Menu */}
            <div
                className="absolute top-4 right-4 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <RecipeActionMenu
                    recipe={recipe}
                    userId={user?.id}
                />
            </div>

            {/* Recipe Image */}
            {recipe.imageURL && (
                <div className="w-full h-48 overflow-hidden rounded-t-xl">
                    <ImageSkeleton
                        src={recipe.imageURL}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        aspectRatio="16/9"
                    />
                </div>
            )}

            <CardHeader>
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
                {/* Diet Badges */}
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

                {/* Time Information */}
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

                {/* Ingredients and Equipment Count */}
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

                {/* Source Link */}
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
