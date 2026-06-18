/** @format */

"use client";

import { Check, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecipeImageUrl } from "@/lib/utils/recipe-image";

interface RecipeGridItemProps {
    recipe: {
        id: string;
        name: string;
        imageURL?: string | null;
        imageFile?: { url?: string | null } | null;
    };
    selected: boolean;
    onToggle: () => void;
}

export function RecipeGridItem({
    recipe,
    selected,
    onToggle,
}: RecipeGridItemProps) {
    const imageUrl = getRecipeImageUrl(recipe);

    return (
        <div
            className={cn(
                "relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all",
                selected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
            )}
            onClick={onToggle}
        >
            {selected && (
                <div className="absolute top-2 right-2 z-10 bg-primary rounded-full p-1">
                    <Check className="h-3 w-3 text-primary-foreground" />
                </div>
            )}

            <div className="aspect-square bg-muted relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                )}
            </div>

            <div className="p-2">
                <p
                    className="text-sm font-medium line-clamp-2"
                    title={recipe.name}
                >
                    {recipe.name}
                </p>
            </div>
        </div>
    );
}
