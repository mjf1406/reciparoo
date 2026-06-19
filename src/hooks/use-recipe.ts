/** @format */

import { useMemo } from "react";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";
import {
    buildMergedRecipeContent,
    getMealComponentIds,
    parseMealComponents,
    type ComponentRecipeLike,
} from "@/lib/utils/recipe-meal";

export type RecipeWithFiles = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        imageFile: {};
        nutritionFile: {};
        folder: {};
    }
>;

export default function useRecipe(recipeId: string | undefined) {
    const query = recipeId
        ? {
              recipes: {
                  $: { where: { id: recipeId } },
                  imageFile: {},
                  nutritionFile: {},
                  folder: {},
              },
          }
        : null;

    const { data, isLoading, error } = db.useQuery(query);

    const rawRecipe = (data?.recipes?.[0] ?? null) as RecipeWithFiles | null;

    const componentIds = useMemo(
        () =>
            rawRecipe?.isMeal
                ? getMealComponentIds(rawRecipe.components)
                : [],
        [rawRecipe?.isMeal, rawRecipe?.components]
    );

    const componentQuery =
        componentIds.length > 0
            ? {
                  recipes: {
                      $: { where: { id: { $in: componentIds } } },
                  },
              }
            : null;

    const {
        data: componentData,
        isLoading: componentsLoading,
        error: componentsError,
    } = db.useQuery(componentQuery);

    const componentRecipes = useMemo(() => {
        const recipes = (componentData?.recipes ?? []) as ComponentRecipeLike[];
        const order = new Map(componentIds.map((id, index) => [id, index]));
        return [...recipes].sort(
            (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
        );
    }, [componentData?.recipes, componentIds]);

    const recipe = useMemo(() => {
        if (!rawRecipe) return null;
        if (!rawRecipe.isMeal) return rawRecipe;

        const components = parseMealComponents(rawRecipe.components);
        const merged = buildMergedRecipeContent(
            rawRecipe,
            components,
            componentRecipes
        );

        return {
            ...rawRecipe,
            ingredients: merged.ingredients,
            equipment: merged.equipment,
            procedure: merged.procedure,
            yield: merged.yield ?? rawRecipe.yield,
        } as RecipeWithFiles;
    }, [rawRecipe, componentRecipes]);

    return {
        recipe,
        rawRecipe,
        componentRecipes,
        isLoading: isLoading || (rawRecipe?.isMeal && componentsLoading),
        error: error ?? componentsError,
    };
}
