/** @format */

export const MIN_RECIPE_SCALE = 0.25;
export const MAX_RECIPE_SCALE = 10;

export function clampRecipeScale(scale: number): number {
    return Math.max(MIN_RECIPE_SCALE, Math.min(MAX_RECIPE_SCALE, scale));
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

export function decimalToFractionParts(
    decimal: number
): { whole: number; num: number; den: number } | null {
    if (decimal % 1 === 0) {
        return { whole: decimal, num: 0, den: 1 };
    }

    const tolerance = 0.001;
    for (let denom = 2; denom <= 16; denom++) {
        for (let num = 1; num < denom; num++) {
            const value = num / denom;
            if (Math.abs(decimal - value) < tolerance) {
                const divisor = gcd(num, denom);
                return {
                    whole: 0,
                    num: num / divisor,
                    den: denom / divisor,
                };
            }
        }
    }

    const whole = Math.floor(decimal);
    const remainder = decimal - whole;
    if (whole > 0 && remainder > 0) {
        for (let denom = 2; denom <= 16; denom++) {
            for (let num = 1; num < denom; num++) {
                const value = num / denom;
                if (Math.abs(remainder - value) < tolerance) {
                    const divisor = gcd(num, denom);
                    return {
                        whole,
                        num: num / divisor,
                        den: denom / divisor,
                    };
                }
            }
        }
    }

    return null;
}

export function formatNumberAsFractionString(num: number): string {
    const parts = decimalToFractionParts(num);

    if (!parts) {
        return num.toFixed(2).replace(/\.?0+$/, "");
    }

    const { whole, num: numerator, den: denominator } = parts;

    if (denominator === 1) {
        return whole.toString();
    }

    if (whole === 0) {
        return `${numerator}/${denominator}`;
    }

    return `${whole} ${numerator}/${denominator}`;
}

export function getScaledQuantityString(
    quantity: string,
    scale: number
): string {
    if (!quantity || quantity.trim() === "") return "";

    const num = parseFloat(quantity);
    if (isNaN(num)) return quantity;

    return formatNumberAsFractionString(num * scale);
}

export function getScaledYieldString(
    yieldValue: number,
    scale: number
): string {
    return formatNumberAsFractionString(yieldValue * scale);
}
