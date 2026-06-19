/** @format */

"use client";

import { useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    getRecipeImageUrl,
    getRecipeNutritionImageUrl,
} from "@/lib/utils/recipe-image";
import {
    parseDietTypes,
    parseEquipment,
    parseIngredients,
    parseProcedure,
    formatRecipeTime,
} from "@/lib/utils/recipe-parse";
import {
    getScaledQuantityString,
    getScaledYieldString,
} from "@/lib/utils/recipe-quantities";
import { generatePublicRecipeLink } from "@/lib/utils/recipe-sharing";
import type { RecipePrintOptions } from "@/lib/utils/recipe-print";
import type { RecipeWithFiles } from "@/hooks/use-recipe";
import type { PublicRecipe } from "@/hooks/use-public-recipe";
import "@/styles/print.css";

type PrintableRecipe = RecipeWithFiles | PublicRecipe;

export interface PrintNote {
    id: string;
    content: string;
    created: Date | string | number;
}

interface RecipePrintViewProps {
    recipe: PrintableRecipe;
    options: RecipePrintOptions;
    notes?: PrintNote[];
}

export function RecipePrintView({
    recipe,
    options,
    notes = [],
}: RecipePrintViewProps) {
    const hasTriggeredPrint = useRef(false);

    const ingredients = parseIngredients(recipe.ingredients);
    const equipment = parseEquipment(recipe.equipment);
    const { procedureSteps, instructionSections, isOldProcedureFormat } =
        parseProcedure(recipe.procedure);
    const dietTypes = parseDietTypes(recipe.diet);
    const prepTime = formatRecipeTime(recipe.prepTime);
    const cookTime = formatRecipeTime(recipe.cookTime);

    const imageUrl = options.photos ? getRecipeImageUrl(recipe) : undefined;
    const nutritionImageUrl = options.nutrition
        ? getRecipeNutritionImageUrl(recipe)
        : undefined;

    const publicUrl = generatePublicRecipeLink(recipe.id);
    const printedDate = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const showNutritionInline =
        nutritionImageUrl && !options.nutritionOwnPage;
    const showNutritionOwnPage =
        nutritionImageUrl && options.nutritionOwnPage;

    const nutritionLabelSection = nutritionImageUrl ? (
        <section
            className={
                options.nutritionOwnPage
                    ? "recipe-print-section recipe-print-page-break-before recipe-print-nutrition-page"
                    : "recipe-print-section"
            }
        >
            {options.nutritionOwnPage && (
                <p className="text-sm text-gray-500 mb-1">{recipe.name}</p>
            )}
            <h2 className="text-lg font-semibold mb-2">Nutrition Label</h2>
            <img
                src={nutritionImageUrl}
                alt={`${recipe.name} nutrition label`}
                className={
                    options.nutritionOwnPage
                        ? "recipe-print-nutrition-image"
                        : "recipe-print-image max-w-full"
                }
            />
        </section>
    ) : null;

    const hasMetadata =
        options.metadata &&
        (dietTypes.length > 0 ||
            prepTime ||
            cookTime ||
            recipe.servingSize ||
            recipe.servingUnit ||
            recipe.yield ||
            recipe.source ||
            recipe.videoURL);

    useEffect(() => {
        if (!options.autoPrint || hasTriggeredPrint.current) return;

        const images = document.querySelectorAll(".recipe-print-page img");
        let pending = images.length;

        const triggerPrint = () => {
            if (hasTriggeredPrint.current) return;
            hasTriggeredPrint.current = true;
            window.setTimeout(() => window.print(), 150);
        };

        if (pending === 0) {
            triggerPrint();
            return;
        }

        const onImageDone = () => {
            pending -= 1;
            if (pending <= 0) triggerPrint();
        };

        images.forEach((img) => {
            const el = img as HTMLImageElement;
            if (el.complete) {
                onImageDone();
            } else {
                el.addEventListener("load", onImageDone, { once: true });
                el.addEventListener("error", onImageDone, { once: true });
            }
        });

        const fallback = window.setTimeout(triggerPrint, 2000);
        return () => window.clearTimeout(fallback);
    }, [options.autoPrint, imageUrl, nutritionImageUrl]);

    return (
        <div className="recipe-print-page min-h-screen bg-white text-black">
            <div className="recipe-print-no-print fixed top-4 right-4 z-50">
                <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    onClick={() => window.print()}
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                </Button>
            </div>

            <article className="max-w-3xl mx-auto px-6 py-10 space-y-6">
                <header className="recipe-print-section space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold">{recipe.name}</h1>
                        {options.scale !== 1 && (
                            <Badge variant="secondary" className="text-sm">
                                Printed at {options.scale}×
                            </Badge>
                        )}
                    </div>
                </header>

                {imageUrl && (
                    <div className="recipe-print-section">
                        <img
                            src={imageUrl}
                            alt={recipe.name ?? "Recipe"}
                            className="recipe-print-image w-full rounded-lg"
                        />
                    </div>
                )}

                {hasMetadata && (
                    <section className="recipe-print-section space-y-2 text-sm">
                        {dietTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {dietTypes.map((diet, index) => (
                                    <span
                                        key={index}
                                        className="inline-block rounded-full border border-gray-300 px-2 py-0.5 text-xs"
                                    >
                                        {diet}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
                            {prepTime && <span>Prep: {prepTime}</span>}
                            {cookTime && <span>Cook: {cookTime}</span>}
                            {recipe.yield != null && (
                                <span>
                                    Yield:{" "}
                                    {getScaledYieldString(
                                        recipe.yield,
                                        options.scale
                                    )}
                                </span>
                            )}
                            {(recipe.servingSize || recipe.servingUnit) && (
                                <span>
                                    Serving size:{" "}
                                    {recipe.servingSize
                                        ? `${recipe.servingSize}${
                                              recipe.servingUnit
                                                  ? ` ${recipe.servingUnit}`
                                                  : ""
                                          }`
                                        : recipe.servingUnit}
                                </span>
                            )}
                        </div>
                        {recipe.source && (
                            <p className="text-sm break-all">
                                Source: {recipe.source}
                            </p>
                        )}
                        {recipe.videoURL && (
                            <p className="text-sm break-all">
                                Video: {recipe.videoURL}
                            </p>
                        )}
                    </section>
                )}

                {options.description && recipe.description && (
                    <p className="text-gray-700">{recipe.description}</p>
                )}

                {showNutritionInline && nutritionLabelSection}

                {ingredients.length > 0 && (
                    <section className="recipe-print-section">
                        <h2 className="text-xl font-semibold mb-3">
                            Ingredients
                        </h2>
                        <ul className="space-y-1">
                            {ingredients.map((ingredient, index) => (
                                <li
                                    key={index}
                                    className="recipe-print-break-avoid"
                                >
                                    {getScaledQuantityString(
                                        ingredient.quantity,
                                        options.scale
                                    )}{" "}
                                    {ingredient.unit && `${ingredient.unit} `}
                                    {ingredient.name}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {options.equipment && equipment.length > 0 && (
                    <section className="recipe-print-section">
                        <h2 className="text-xl font-semibold mb-3">
                            Equipment
                        </h2>
                        <ul className="list-disc pl-5 space-y-1">
                            {equipment.map((item, index) => (
                                <li
                                    key={index}
                                    className="recipe-print-break-avoid"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {options.instructions &&
                    (isOldProcedureFormat
                        ? procedureSteps.length > 0
                        : instructionSections.length > 0) && (
                        <section className="recipe-print-section">
                            <h2 className="text-xl font-semibold mb-3">
                                Instructions
                            </h2>
                            {isOldProcedureFormat ? (
                                <ol className="list-decimal pl-5 space-y-3">
                                    {procedureSteps.map((step) => (
                                        <li
                                            key={step.step}
                                            className="recipe-print-break-avoid"
                                        >
                                            {step.instruction}
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="space-y-4">
                                    {instructionSections.map(
                                        (section, sectionIndex) => (
                                            <div key={sectionIndex}>
                                                {section.title && (
                                                    <h3 className="font-semibold mb-2">
                                                        {section.title}
                                                    </h3>
                                                )}
                                                <ol className="list-decimal pl-5 space-y-3">
                                                    {section.steps.map(
                                                        (step) => (
                                                            <li
                                                                key={step.step}
                                                                className="recipe-print-break-avoid"
                                                            >
                                                                {
                                                                    step.instruction
                                                                }
                                                            </li>
                                                        )
                                                    )}
                                                </ol>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                {options.notes && notes.length > 0 && (
                    <section className="recipe-print-section">
                        <h2 className="text-xl font-semibold mb-3">Notes</h2>
                        <ul className="space-y-3">
                            {notes.map((note) => (
                                <li
                                    key={note.id}
                                    className="recipe-print-break-avoid border-l-2 border-gray-300 pl-3"
                                >
                                    <p className="whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(
                                            note.created
                                        ).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <footer className="recipe-print-section pt-6 border-t border-gray-200 text-xs text-gray-500">
                    Printed from Reciparoo · {printedDate} · {publicUrl}
                </footer>

                {showNutritionOwnPage && nutritionLabelSection}
            </article>
        </div>
    );
}
