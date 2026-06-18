/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type MealPlanWithRelations = InstaQLEntity<
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

export default function useMealPlans() {
    const query = {
        mealPlans: {
            mealSlots: {
                mealSlotRecipes: {
                    recipe: {
                        imageFile: {},
                    },
                },
            },
        },
    };

    const { data, isLoading, error } = db.useQuery(query);

    const mealPlans = (data?.mealPlans || []) as unknown as MealPlanWithRelations[];

    return {
        mealPlans,
        isLoading,
        error,
    };
}
