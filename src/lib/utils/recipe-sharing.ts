/** @format */

/**
 * Generate a public recipe link
 * @param recipeId - The recipe ID
 * @returns Full public URL for the recipe
 */
export function generatePublicRecipeLink(recipeId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/recipes/${recipeId}`;
}

/**
 * Generate a home-based recipe link
 * @param homeId - The home ID
 * @param recipeId - The recipe ID
 * @returns Full home-based URL for the recipe
 */
export function generateHomeRecipeLink(
    homeId: string,
    recipeId: string
): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/home/${homeId}/recipes/${recipeId}`;
}

/**
 * Copy a recipe link to clipboard
 * @param url - The URL to copy
 * @returns Promise that resolves when copy is complete
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
 * @param recipeName - The name of the recipe
 * @param url - The URL to share
 * @returns Promise that resolves when share is complete
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
            // User cancelled or error occurred
            if ((error as Error).name !== "AbortError") {
                console.error("Error sharing:", error);
            }
            // Fallback to copy
            await copyRecipeLink(url);
        }
    } else {
        // Fallback to copy if share API is not available
        await copyRecipeLink(url);
    }
}
