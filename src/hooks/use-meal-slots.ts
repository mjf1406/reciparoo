/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type MealSlotWithRelations = InstaQLEntity<
    AppSchema,
    "mealSlots",
    {
        mealPlan: {};
        mealSlotRecipes: {
            recipe: {
                imageFile: {};
            };
        };
    }
>;

export default function useMealSlots(mealPlanId: string | undefined) {
    const query = mealPlanId
        ? {
              mealSlots: {
                  $: {
                      where: {
                          "mealPlan.id": mealPlanId,
                      },
                  },
                  mealPlan: {},
                  mealSlotRecipes: {
                      recipe: {
                          imageFile: {},
                      },
                  },
              },
          }
        : null;

    const { data, isLoading, error } = db.useQuery(query);

    const mealSlots = (data?.mealSlots || []) as unknown as MealSlotWithRelations[];

    return {
        mealSlots,
        isLoading,
        error,
    };
}
