/** @format */

type RecipeWithImageFields = {
    imageURL?: string | null;
    nutritionLabelImageURL?: string | null;
    imageFile?: { url?: string | null } | null;
    nutritionFile?: { url?: string | null } | null;
};

export function getRecipeImageUrl(recipe: RecipeWithImageFields): string | undefined {
    return recipe.imageFile?.url ?? recipe.imageURL ?? undefined;
}

export function getRecipeNutritionImageUrl(
    recipe: RecipeWithImageFields
): string | undefined {
    return recipe.nutritionFile?.url ?? recipe.nutritionLabelImageURL ?? undefined;
}
