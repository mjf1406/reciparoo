/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type Recipe = InstaQLEntity<AppSchema, "recipes">;

export default function usePublicRecipe(recipeId: string | undefined) {
    // Query recipe without requiring authentication
    // Recipes have view: "true" in permissions, so they're publicly accessible
    const query = recipeId
        ? {
              recipes: {
                  $: { where: { id: recipeId } },
              },
          }
        : null;

    const { data, isLoading, error } = db.useQuery(query);

    const recipes =
        query && data ? (data as { recipes?: unknown[] }).recipes : undefined;
    const recipe = (recipes?.[0] ?? null) as Recipe | null;

    return {
        recipe,
        isLoading,
        error,
    };
}
