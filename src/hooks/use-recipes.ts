/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type RecipeWithRelations = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        folder: {};
        imageFile: {};
        nutritionFile: {};
    }
>;

export default function useRecipes(folderId?: string | null) {
    const query = {
        recipes: {
            $: {
                where: {
                    ...(folderId === null || folderId === undefined
                        ? { "folder.id": { $isNull: true } }
                        : { "folder.id": folderId }),
                },
            },
            folder: {},
            imageFile: {},
            nutritionFile: {},
        },
    };

    const { data, isLoading, error } = db.useQuery(query);

    const recipes = (data?.recipes || []) as unknown as RecipeWithRelations[];

    return {
        recipes,
        isLoading,
        error,
    };
}
