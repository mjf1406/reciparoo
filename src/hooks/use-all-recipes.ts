/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type RecipeListItem = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        imageFile: {};
    }
>;

export default function useAllRecipes() {
    const { data, isLoading, error } = db.useQuery({
        recipes: {
            imageFile: {},
        },
    });

    const recipes = (data?.recipes ?? []) as unknown as RecipeListItem[];

    return {
        recipes,
        isLoading,
        error,
    };
}
