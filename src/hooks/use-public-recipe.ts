/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type PublicRecipe = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        imageFile: {};
        nutritionFile: {};
    }
>;

export default function usePublicRecipe(recipeId: string | undefined) {
    const query = recipeId
        ? {
              recipes: {
                  $: { where: { id: recipeId } },
                  imageFile: {},
                  nutritionFile: {},
              },
          }
        : null;

    const { data, isLoading, error } = db.useQuery(query);

    const recipe = (data?.recipes?.[0] ?? null) as PublicRecipe | null;

    return {
        recipe,
        isLoading,
        error,
    };
}
