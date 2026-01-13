/** @format */

import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type MealPlanDetailWithRelations = InstaQLEntity<
    AppSchema,
    "mealPlans",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
            recipes: {};
        };
        mealSlots: {
            mealSlotRecipes: {
                recipe: {};
            };
        };
    }
>;

export default function useMealPlan(mealPlanId: string | undefined) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user is available and mealPlanId exists
    const query =
        user?.id && mealPlanId
            ? {
                  mealPlans: {
                      $: {
                          where: {
                              id: mealPlanId,
                          },
                      },
                      home: {
                          owner: {},
                          admins: {},
                          homeMembers: {},
                          viewers: {},
                          recipes: {},
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

    const mealPlan =
        query && data
            ? ((data as { mealPlans?: unknown[] }).mealPlans?.[0] as
                  | MealPlanDetailWithRelations
                  | undefined)
            : undefined;
    const isLoading = authLoading || queryLoading;

    return {
        mealPlan,
        isLoading,
        error,
    };
}
