/** @format */

import { useState, useEffect, useCallback } from "react";

const getStorageKey = (recipeId: string) => `recipe-scale-${recipeId}`;

const loadScale = (recipeId: string): number => {
    try {
        const stored = localStorage.getItem(getStorageKey(recipeId));
        if (stored) {
            const parsed = parseFloat(stored);
            return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
        }
    } catch (error) {
        console.error("Error loading scale:", error);
    }
    return 1; // Default to 1x (original recipe)
};

const saveScale = (recipeId: string, scale: number) => {
    try {
        localStorage.setItem(getStorageKey(recipeId), scale.toString());
    } catch (error) {
        console.error("Error saving scale:", error);
    }
};

export function useRecipeScale(recipeId: string) {
    const [scale, setScale] = useState<number>(() => loadScale(recipeId));

    // Reload scale when recipeId changes
    useEffect(() => {
        setScale(loadScale(recipeId));
    }, [recipeId]);

    const setScaleValue = useCallback(
        (newScale: number) => {
            const clampedScale = Math.max(0.25, Math.min(10, newScale)); // Limit between 0.25x and 10x
            saveScale(recipeId, clampedScale);
            setScale(clampedScale);
        },
        [recipeId]
    );

    const resetScale = useCallback(() => {
        saveScale(recipeId, 1);
        setScale(1);
    }, [recipeId]);

    return {
        scale,
        setScale: setScaleValue,
        resetScale,
    };
}
