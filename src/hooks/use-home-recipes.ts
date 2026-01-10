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

export default function useHomeRecipes(homeId: string) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user is available
    const query = user?.id
        ? {
              recipes: {
                  $: {
                      where: { "home.id": homeId },
                  },
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
            ? ((data as { recipes?: unknown[] }).recipes || []) as RecipeWithHome[]
            : [];
    const isLoading = authLoading || queryLoading;

    return {
        recipes,
        isLoading,
        error,
    };
}
