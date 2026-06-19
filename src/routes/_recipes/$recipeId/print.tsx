/** @format */

import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import useRecipe from "@/hooks/use-recipe";
import { db } from "@/lib/db/db";
import { RecipePrintView } from "@/components/recipes/recipe-print-view";
import { parsePrintOptions } from "@/lib/utils/recipe-print";

export const Route = createFileRoute("/_recipes/$recipeId/print")({
    validateSearch: (search: Record<string, unknown>) => search,
    component: RecipePrintPage,
});

function RecipePrintPage() {
    const { recipeId } = Route.useParams();
    const search = Route.useSearch();
    const options = parsePrintOptions(search);

    const {
        recipe,
        isLoading: recipeLoading,
        error: recipeError,
    } = useRecipe(recipeId);

    const notesQuery =
        options.notes && recipeId
            ? {
                  notes: {
                      $: {
                          where: { "recipe.id": recipeId },
                          order: { created: "desc" as const },
                      },
                  },
              }
            : null;

    const { data: notesData, isLoading: notesLoading } =
        db.useQuery(notesQuery);

    const isLoading = recipeLoading || (options.notes && notesLoading);
    const error = recipeError;

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

    const notes = options.notes ? (notesData?.notes ?? []) : [];

    return (
        <RecipePrintView
            recipe={recipe}
            options={options}
            notes={notes.map((note) => ({
                id: note.id,
                content: note.content,
                created: note.created,
            }))}
        />
    );
}
