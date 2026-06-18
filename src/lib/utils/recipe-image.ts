/** @format */

type FileWithUrl = { url?: string | null };

type RecipeWithImageFields = {
    imageURL?: string | null;
    nutritionLabelImageURL?: string | null;
    imageFile?: FileWithUrl | FileWithUrl[] | null;
    nutritionFile?: FileWithUrl | FileWithUrl[] | null;
};

function fileUrl(file: FileWithUrl | FileWithUrl[] | null | undefined): string | undefined {
    if (!file) return undefined;
    if (Array.isArray(file)) {
        return file[0]?.url ?? undefined;
    }
    return file.url ?? undefined;
}

export function getRecipeImageUrl(recipe: RecipeWithImageFields): string | undefined {
    return fileUrl(recipe.imageFile) ?? recipe.imageURL ?? undefined;
}

export function getRecipeNutritionImageUrl(
    recipe: RecipeWithImageFields
): string | undefined {
    return (
        fileUrl(recipe.nutritionFile) ?? recipe.nutritionLabelImageURL ?? undefined
    );
}
