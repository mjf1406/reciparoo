/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type RecipeWithFiles = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        imageFile: {};
        nutritionFile: {};
        folder: {};
    }
>;

export default function useRecipe(recipeId: string | undefined) {
    const query = recipeId
        ? {
              recipes: {
                  $: { where: { id: recipeId } },
                  imageFile: {},
                  nutritionFile: {},
                  folder: {},
              },
          }
        : null;

    const { data, isLoading, error } = db.useQuery(query);

    const recipe = (data?.recipes?.[0] ?? null) as RecipeWithFiles | null;

    return {
        recipe,
        isLoading,
        error,
    };
}
