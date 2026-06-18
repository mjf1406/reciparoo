/** @format */

/**
 * Generate a public recipe link
 */
export function generatePublicRecipeLink(recipeId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/recipes/${recipeId}`;
}

/**
 * Copy a recipe link to clipboard
 */
export async function copyRecipeLink(url: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(url);
    } catch (error) {
        console.error("Failed to copy link:", error);
        throw error;
    }
}

/**
 * Share a recipe using native share API or fallback to copy
 */
export async function shareRecipe(
    recipeName: string,
    url: string
): Promise<void> {
    if (navigator.share) {
        try {
            await navigator.share({
                title: recipeName,
                text: `Check out this recipe: ${recipeName}`,
                url: url,
            });
        } catch (error) {
            if ((error as Error).name !== "AbortError") {
                console.error("Error sharing:", error);
            }
            await copyRecipeLink(url);
        }
    } else {
        await copyRecipeLink(url);
    }
}
