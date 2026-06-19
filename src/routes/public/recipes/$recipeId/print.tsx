/** @format */

import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import usePublicRecipe from "@/hooks/use-public-recipe";
import { RecipePrintView } from "@/components/recipes/recipe-print-view";
import { parsePrintOptions } from "@/lib/utils/recipe-print";

export const Route = createFileRoute("/public/recipes/$recipeId/print")({
    validateSearch: (search: Record<string, unknown>) => search,
    component: PublicRecipePrintPage,
});

function PublicRecipePrintPage() {
    const { recipeId } = Route.useParams();
    const search = Route.useSearch();
    const options = parsePrintOptions({
        ...search,
        notes: "0",
    });

    const {
        recipe,
        isLoading,
        error,
    } = usePublicRecipe(recipeId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-black">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-black">
                Error: {error.message}
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-black">
                Recipe not found.
            </div>
        );
    }

    return <RecipePrintView recipe={recipe} options={options} />;
}
