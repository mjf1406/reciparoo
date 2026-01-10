/** @format */

import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type RecipeWithHome = InstaQLEntity<
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

export default function useRecipe(recipeId: string | undefined) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user and recipeId are available
    const query = user?.id && recipeId
        ? {
              recipes: {
                  $: { where: { id: recipeId } },
                  home: {
                      owner: {},
                      admins: {},
                      homeMembers: {},
                      viewers: {},
                  },
              },
          }
        : null;

    const { data, isLoading: queryLoading, error } = db.useQuery(query);

    const recipes =
        query && data
            ? (data as { recipes?: unknown[] }).recipes
            : undefined;
    const recipe = (recipes?.[0] ?? null) as RecipeWithHome | null;
    const isLoading = authLoading || queryLoading;

    return {
        recipe,
        isLoading,
        error,
    };
}
