/** @format */

import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type MealPlanWithRelations = InstaQLEntity<
    AppSchema,
    "mealPlans",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
        };
        mealSlots: {
            mealSlotRecipes: {
                recipe: {};
            };
        };
    }
>;

export default function useMealPlans(homeId: string) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user is available
    const query = user?.id
        ? {
              mealPlans: {
                  $: {
                      where: {
                          "home.id": homeId,
                      },
                  },
                  home: {
                      owner: {},
                      admins: {},
                      homeMembers: {},
                      viewers: {},
                  },
                  mealSlots: {
                      mealSlotRecipes: {
                          recipe: {},
                      },
                  },
              },
          }
        : null;

    const { data, isLoading: queryLoading, error } = db.useQuery(query);

    const mealPlans =
        query && data
            ? ((data as { mealPlans?: unknown[] }).mealPlans ||
                  []) as MealPlanWithRelations[]
            : [];
    const isLoading = authLoading || queryLoading;

    return {
        mealPlans,
        isLoading,
        error,
    };
}
