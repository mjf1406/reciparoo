/** @format */

import type { ReactNode } from "react";
import { decimalToFractionParts } from "@/lib/utils/recipe-quantities";

export function formatNumberAsFraction(num: number): ReactNode {
    const parts = decimalToFractionParts(num);

    if (!parts) {
        return num.toFixed(2).replace(/\.?0+$/, "");
    }

    const { whole, num: numerator, den: denominator } = parts;

    if (denominator === 1) {
        return whole.toString();
    }

    if (whole === 0) {
        return (
            <span className="inline-flex items-baseline mr-1">
                <sup className="text-[0.7em] leading-none mr-0.5">
                    {numerator}
                </sup>
                <span>⁄</span>
                <sub className="text-[0.7em] leading-none ml-0.5">
                    {denominator}
                </sub>
            </span>
        );
    }

    return (
        <span className="inline-flex items-baseline mr-1">
            <span className="mr-1">{whole}</span>
            <span className="inline-flex items-baseline">
                <sup className="text-[0.7em] leading-none mr-0.5">
                    {numerator}
                </sup>
                <span>⁄</span>
                <sub className="text-[0.7em] leading-none ml-0.5">
                    {denominator}
                </sub>
            </span>
        </span>
    );
}

export function getScaledQuantity(
    quantity: string,
    scale: number
): ReactNode {
    if (!quantity || quantity.trim() === "") return "";

    const num = parseFloat(quantity);
    if (isNaN(num)) return quantity;

    return formatNumberAsFraction(num * scale);
}

export function formatQuantity(quantity: string): ReactNode {
    if (!quantity || quantity.trim() === "") return "";

    const num = parseFloat(quantity);
    if (isNaN(num)) return quantity;

    return formatNumberAsFraction(num);
}

export function getScaledYield(yieldValue: number, scale: number): ReactNode {
    return formatNumberAsFraction(yieldValue * scale);
}
