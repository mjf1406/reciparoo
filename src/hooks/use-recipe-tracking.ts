/** @format */

import { useState, useEffect, useCallback } from "react";

interface TrackingState {
    ingredients: Set<number>;
    equipment: Set<number>;
    procedures: Set<number>;
}

const getStorageKey = (recipeId: string) => `recipe-tracking-${recipeId}`;

const loadState = (recipeId: string): TrackingState => {
    try {
        const stored = localStorage.getItem(getStorageKey(recipeId));
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                ingredients: new Set(parsed.ingredients || []),
                equipment: new Set(parsed.equipment || []),
                procedures: new Set(parsed.procedures || []),
            };
        }
    } catch (error) {
        console.error("Error loading tracking state:", error);
    }
    return {
        ingredients: new Set<number>(),
        equipment: new Set<number>(),
        procedures: new Set<number>(),
    };
};

const saveState = (recipeId: string, state: TrackingState) => {
    try {
        const serialized = {
            ingredients: Array.from(state.ingredients),
            equipment: Array.from(state.equipment),
            procedures: Array.from(state.procedures),
        };
        localStorage.setItem(getStorageKey(recipeId), JSON.stringify(serialized));
    } catch (error) {
        console.error("Error saving tracking state:", error);
    }
};

export function useRecipeTracking(recipeId: string) {
    const [state, setState] = useState<TrackingState>(() => loadState(recipeId));

    // Reload state when recipeId changes
    useEffect(() => {
        setState(loadState(recipeId));
    }, [recipeId]);

    const toggleItem = useCallback(
        (section: "ingredients" | "equipment" | "procedures", index: number) => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    [section]: new Set(prev[section]),
                };
                if (newState[section].has(index)) {
                    newState[section].delete(index);
                } else {
                    newState[section].add(index);
                }
                saveState(recipeId, newState);
                return newState;
            });
        },
        [recipeId]
    );

    const resetSection = useCallback(
        (section: "ingredients" | "equipment" | "procedures") => {
            setState((prev) => {
                const newState = {
                    ...prev,
                    [section]: new Set<number>(),
                };
                saveState(recipeId, newState);
                return newState;
            });
        },
        [recipeId]
    );

    const resetAll = useCallback(() => {
        const newState: TrackingState = {
            ingredients: new Set<number>(),
            equipment: new Set<number>(),
            procedures: new Set<number>(),
        };
        saveState(recipeId, newState);
        setState(newState);
    }, [recipeId]);

    const isChecked = useCallback(
        (section: "ingredients" | "equipment" | "procedures", index: number) => {
            return state[section].has(index);
        },
        [state]
    );

    return {
        toggleItem,
        resetSection,
        resetAll,
        isChecked,
    };
}
