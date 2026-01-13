/** @format */

import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type MealSlotWithRelations = InstaQLEntity<
    AppSchema,
    "mealSlots",
    {
        mealPlan: {
            home: {
                owner: {};
                admins: {};
                homeMembers: {};
                viewers: {};
            };
        };
        mealSlotRecipes: {
            recipe: {};
        };
    }
>;

export default function useMealSlots(mealPlanId: string | undefined) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user is available and mealPlanId exists
    const query =
        user?.id && mealPlanId
            ? {
                  mealSlots: {
                      $: {
                          where: {
                              "mealPlan.id": mealPlanId,
                          },
                      },
                      mealPlan: {
                          home: {
                              owner: {},
                              admins: {},
                              homeMembers: {},
                              viewers: {},
                          },
                      },
                      mealSlotRecipes: {
                          recipe: {},
                      },
                  },
              }
            : null;

    const { data, isLoading: queryLoading, error } = db.useQuery(query);

    const mealSlots =
        query && data
            ? ((data as { mealSlots?: unknown[] }).mealSlots ||
                  []) as MealSlotWithRelations[]
            : [];
    const isLoading = authLoading || queryLoading;

    return {
        mealSlots,
        isLoading,
        error,
    };
}
