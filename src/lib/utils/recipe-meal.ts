/** @format */

import {
    parseIngredients,
    parseEquipment,
    parseProcedure,
    type Ingredient,
    type ProcedureStep,
} from "@/lib/utils/recipe-parse";

export interface MealComponent {
    recipeId: string;
    multiplier: number;
}

export interface MealRecipeLike {
    ingredients?: string | null;
    equipment?: string | null;
    procedure?: string | null;
    yield?: number | null;
}

export interface ComponentRecipeLike extends MealRecipeLike {
    id: string;
    name?: string | null;
}

export function parseMealComponents(components?: string | null): MealComponent[] {
    if (!components) return [];
    try {
        const parsed = JSON.parse(components) as MealComponent[];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (c) =>
                typeof c.recipeId === "string" &&
                c.recipeId.length > 0 &&
                typeof c.multiplier === "number" &&
                c.multiplier > 0
        );
    } catch {
        return [];
    }
}

function ingredientKey(name: string, unit: string): string {
    return `${name.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;
}

function scaleIngredientQuantity(quantity: string, multiplier: number): string {
    const trimmed = quantity.trim();
    if (!trimmed) return trimmed;

    const num = parseFloat(trimmed);
    if (isNaN(num)) return trimmed;

    const scaled = num * multiplier;
    if (Number.isInteger(scaled)) return String(scaled);
    return String(parseFloat(scaled.toFixed(4)));
}

function mergeIngredients(
    componentIngredients: Ingredient[],
    customIngredients: Ingredient[]
): Ingredient[] {
    const merged: Ingredient[] = [];
    const numericBuckets = new Map<
        string,
        { quantity: number; unit: string; name: string }
    >();

    for (const ing of componentIngredients) {
        const quantity = ing.quantity.trim();
        const unit = ing.unit.trim();
        const name = ing.name.trim();
        if (!name) continue;

        const num = parseFloat(quantity);
        if (isNaN(num)) {
            merged.push({ quantity, unit, name });
            continue;
        }

        const key = ingredientKey(name, unit);
        const existing = numericBuckets.get(key);
        if (existing) {
            existing.quantity += num;
        } else {
            numericBuckets.set(key, { quantity: num, unit, name });
        }
    }

    for (const bucket of numericBuckets.values()) {
        const quantity =
            Number.isInteger(bucket.quantity)
                ? String(bucket.quantity)
                : String(parseFloat(bucket.quantity.toFixed(4)));
        merged.push({
            quantity,
            unit: bucket.unit,
            name: bucket.name,
        });
    }

    for (const ing of customIngredients) {
        const quantity = ing.quantity.trim();
        const unit = ing.unit.trim();
        const name = ing.name.trim();
        if (!name) continue;
        merged.push({ quantity, unit, name });
    }

    return merged;
}

function mergeEquipment(
    componentEquipment: string[],
    customEquipment: string[]
): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of [...componentEquipment, ...customEquipment]) {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(trimmed);
    }

    return result;
}

function flattenProcedureSteps(procedureJson?: string | null): ProcedureStep[] {
    const { procedureSteps, instructionSections } = parseProcedure(procedureJson);
    const steps: ProcedureStep[] = [];

    if (procedureSteps.length > 0) {
        steps.push(...procedureSteps);
    } else {
        for (const section of instructionSections) {
            steps.push(...section.steps);
        }
    }

    return steps;
}

function mergeProcedure(
    componentProcedures: string[],
    customProcedureJson?: string | null
): string {
    const allSteps: ProcedureStep[] = [];

    for (const procedureJson of componentProcedures) {
        allSteps.push(...flattenProcedureSteps(procedureJson));
    }

    const customSteps = flattenProcedureSteps(customProcedureJson);
    allSteps.push(...customSteps);

    const renumbered = allSteps
        .filter((step) => step.instruction.trim())
        .map((step, index) => ({
            step: index + 1,
            instruction: step.instruction.trim(),
        }));

    return JSON.stringify(renumbered);
}

function computeMergedYield(
    mealYield: number | null | undefined,
    components: MealComponent[],
    componentRecipes: ComponentRecipeLike[]
): number | undefined {
    if (mealYield != null) return mealYield;

    const recipeMap = new Map(componentRecipes.map((r) => [r.id, r]));
    let total = 0;
    let hasYield = false;

    for (const component of components) {
        const recipe = recipeMap.get(component.recipeId);
        if (recipe?.yield != null) {
            total += recipe.yield * component.multiplier;
            hasYield = true;
        }
    }

    return hasYield ? total : undefined;
}

export function buildMergedRecipeContent(
    meal: MealRecipeLike,
    components: MealComponent[],
    componentRecipes: ComponentRecipeLike[]
): {
    ingredients: string;
    equipment: string;
    procedure: string;
    yield: number | undefined;
} {
    const recipeMap = new Map(componentRecipes.map((r) => [r.id, r]));
    const scaledComponentIngredients: Ingredient[] = [];

    for (const component of components) {
        const recipe = recipeMap.get(component.recipeId);
        if (!recipe) continue;

        const ingredients = parseIngredients(recipe.ingredients);
        for (const ing of ingredients) {
            scaledComponentIngredients.push({
                quantity: scaleIngredientQuantity(
                    ing.quantity,
                    component.multiplier
                ),
                unit: ing.unit,
                name: ing.name,
            });
        }
    }

    const customIngredients = parseIngredients(meal.ingredients);
    const mergedIngredients = mergeIngredients(
        scaledComponentIngredients,
        customIngredients
    );

    const componentEquipment: string[] = [];
    for (const component of components) {
        const recipe = recipeMap.get(component.recipeId);
        if (!recipe) continue;
        componentEquipment.push(...parseEquipment(recipe.equipment));
    }

    const customEquipment = parseEquipment(meal.equipment);
    const mergedEquipment = mergeEquipment(componentEquipment, customEquipment);

    const componentProcedures: string[] = [];
    for (const component of components) {
        const recipe = recipeMap.get(component.recipeId);
        if (!recipe?.procedure) continue;
        componentProcedures.push(recipe.procedure);
    }

    const mergedProcedure = mergeProcedure(
        componentProcedures,
        meal.procedure
    );

    const mergedYield = computeMergedYield(
        meal.yield,
        components,
        componentRecipes
    );

    return {
        ingredients: JSON.stringify(mergedIngredients),
        equipment: JSON.stringify(mergedEquipment),
        procedure: mergedProcedure,
        yield: mergedYield,
    };
}

export function getMealComponentIds(components?: string | null): string[] {
    return parseMealComponents(components).map((c) => c.recipeId);
}
