/** @format */

import { arrayMove } from "@dnd-kit/sortable";
import type { ProcedureStep } from "@/lib/utils/recipe-parse";

export function reorderArray<T>(
    items: T[],
    fromIndex: number,
    toIndex: number
): T[] {
    return arrayMove(items, fromIndex, toIndex);
}

export function renumberSteps(steps: ProcedureStep[]): ProcedureStep[] {
    return steps.map((step, index) => ({
        ...step,
        step: index + 1,
    }));
}
