/** @format */

import { clampRecipeScale } from "@/lib/utils/recipe-quantities";

export interface RecipePrintOptions {
    scale: number;
    photos: boolean;
    nutrition: boolean;
    nutritionOwnPage: boolean;
    equipment: boolean;
    description: boolean;
    metadata: boolean;
    instructions: boolean;
    notes: boolean;
    autoPrint: boolean;
}

export const DEFAULT_PRINT_OPTIONS: RecipePrintOptions = {
    scale: 1,
    photos: false,
    nutrition: false,
    nutritionOwnPage: false,
    equipment: true,
    description: true,
    metadata: true,
    instructions: true,
    notes: false,
    autoPrint: true,
};

function parseBool(value: string | null, fallback: boolean): boolean {
    if (value === null) return fallback;
    return value === "1" || value === "true";
}

export function parsePrintOptions(
    search: Record<string, unknown>
): RecipePrintOptions {
    const get = (key: string) => {
        const value = search[key];
        if (value === undefined || value === null) return null;
        return String(value);
    };

    const scaleRaw = parseFloat(get("scale") ?? "1");
    const scale = clampRecipeScale(isNaN(scaleRaw) ? 1 : scaleRaw);

    return {
        scale,
        photos: parseBool(get("photos"), DEFAULT_PRINT_OPTIONS.photos),
        nutrition: parseBool(get("nutrition"), DEFAULT_PRINT_OPTIONS.nutrition),
        nutritionOwnPage: parseBool(
            get("nutritionOwnPage"),
            DEFAULT_PRINT_OPTIONS.nutritionOwnPage
        ),
        equipment: parseBool(get("equipment"), DEFAULT_PRINT_OPTIONS.equipment),
        description: parseBool(
            get("description"),
            DEFAULT_PRINT_OPTIONS.description
        ),
        metadata: parseBool(get("metadata"), DEFAULT_PRINT_OPTIONS.metadata),
        instructions: parseBool(
            get("instructions"),
            DEFAULT_PRINT_OPTIONS.instructions
        ),
        notes: parseBool(get("notes"), DEFAULT_PRINT_OPTIONS.notes),
        autoPrint: parseBool(get("autoPrint"), DEFAULT_PRINT_OPTIONS.autoPrint),
    };
}

export function buildPrintSearchParams(
    options: RecipePrintOptions
): Record<string, string> {
    return {
        scale: String(options.scale),
        photos: options.photos ? "1" : "0",
        nutrition: options.nutrition ? "1" : "0",
        nutritionOwnPage: options.nutritionOwnPage ? "1" : "0",
        equipment: options.equipment ? "1" : "0",
        description: options.description ? "1" : "0",
        metadata: options.metadata ? "1" : "0",
        instructions: options.instructions ? "1" : "0",
        notes: options.notes ? "1" : "0",
        autoPrint: options.autoPrint ? "1" : "0",
    };
}

export function buildAuthPrintUrl(
    recipeId: string,
    options: RecipePrintOptions
): string {
    const params = new URLSearchParams(buildPrintSearchParams(options));
    return `/${recipeId}/print?${params.toString()}`;
}

export function buildPublicPrintUrl(
    recipeId: string,
    options: RecipePrintOptions
): string {
    const params = new URLSearchParams(buildPrintSearchParams(options));
    return `/public/recipes/${recipeId}/print?${params.toString()}`;
}

export function openPrintView(url: string): void {
    window.open(url, "_blank", "noopener,noreferrer");
}
