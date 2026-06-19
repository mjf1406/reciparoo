/** @format */

export interface Ingredient {
    quantity: string;
    unit: string;
    name: string;
}

export interface ProcedureStep {
    step: number;
    instruction: string;
}

export interface InstructionSection {
    title: string;
    steps: ProcedureStep[];
}

function isOldFormat(data: unknown): data is ProcedureStep[] {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0] === "object" &&
        data[0] !== null &&
        "instruction" in data[0] &&
        !("title" in data[0])
    );
}

export function parseIngredients(json?: string | null): Ingredient[] {
    if (!json) return [];
    try {
        return JSON.parse(json) as Ingredient[];
    } catch {
        return [];
    }
}

export function parseEquipment(json?: string | null): string[] {
    if (!json) return [];
    try {
        return JSON.parse(json) as string[];
    } catch {
        return [];
    }
}

export function parseProcedure(json?: string | null): {
    procedureSteps: ProcedureStep[];
    instructionSections: InstructionSection[];
    isOldProcedureFormat: boolean;
} {
    if (!json) {
        return {
            procedureSteps: [],
            instructionSections: [],
            isOldProcedureFormat: true,
        };
    }

    try {
        const parsed = JSON.parse(json);
        if (isOldFormat(parsed)) {
            return {
                procedureSteps: parsed,
                instructionSections: [],
                isOldProcedureFormat: true,
            };
        }
        return {
            procedureSteps: [],
            instructionSections: parsed as InstructionSection[],
            isOldProcedureFormat: false,
        };
    } catch {
        return {
            procedureSteps: [],
            instructionSections: [],
            isOldProcedureFormat: true,
        };
    }
}

export function parseDietTypes(diet?: string | null): string[] {
    if (!diet) return [];
    return diet.split(",").map((d) => d.trim()).filter(Boolean);
}

export function formatRecipeTime(minutes?: number | null): string | null {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
