/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type MealPlanDetailWithRelations = InstaQLEntity<
    AppSchema,
    "mealPlans",
    {
        mealSlots: {
            mealSlotRecipes: {
                recipe: {
                    imageFile: {};
                };
            };
        };
    }
>;

export default function useMealPlan(mealPlanId: string | undefined) {
    const query = mealPlanId
        ? {
              mealPlans: {
                  $: {
                      where: {
                          id: mealPlanId,
                      },
                  },
                  mealSlots: {
                      mealSlotRecipes: {
                          recipe: {
                              imageFile: {},
                          },
                      },
                  },
              },
          }
        : null;

    const { data, isLoading, error } = db.useQuery(query);

    const mealPlan = (data?.mealPlans?.[0] ?? undefined) as
        | MealPlanDetailWithRelations
        | undefined;

    return {
        mealPlan,
        isLoading,
        error,
    };
}
