/** @format */

"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DEFAULT_PRINT_OPTIONS,
    type RecipePrintOptions,
    buildAuthPrintUrl,
    buildPublicPrintUrl,
    openPrintView,
} from "@/lib/utils/recipe-print";
import {
    clampRecipeScale,
    MAX_RECIPE_SCALE,
    MIN_RECIPE_SCALE,
} from "@/lib/utils/recipe-quantities";

interface RecipeExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipeId: string;
    isPublic?: boolean;
    showNotesOption?: boolean;
    initialScale?: number;
}

const SCALE_PRESETS = [0.5, 1, 2, 3, 4];

function SectionToggle({
    id,
    label,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
            <Label htmlFor={id} className="font-normal cursor-pointer">
                {label}
            </Label>
        </div>
    );
}

export function RecipeExportDialog({
    open,
    onOpenChange,
    recipeId,
    isPublic = false,
    showNotesOption = false,
    initialScale = 1,
}: RecipeExportDialogProps) {
    const [options, setOptions] = useState<RecipePrintOptions>({
        ...DEFAULT_PRINT_OPTIONS,
        scale: initialScale,
    });

    useEffect(() => {
        if (open) {
            setOptions({
                ...DEFAULT_PRINT_OPTIONS,
                scale: clampRecipeScale(initialScale),
            });
        }
    }, [open, initialScale]);

    const updateOption = <K extends keyof RecipePrintOptions>(
        key: K,
        value: RecipePrintOptions[K]
    ) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const buildUrl = (autoPrint: boolean) => {
        const finalOptions = { ...options, autoPrint };
        return isPublic
            ? buildPublicPrintUrl(recipeId, finalOptions)
            : buildAuthPrintUrl(recipeId, finalOptions);
    };

    const handleOpenPrintView = () => {
        openPrintView(buildUrl(false));
        onOpenChange(false);
    };

    const handlePrintNow = () => {
        openPrintView(buildUrl(true));
        onOpenChange(false);
    };

    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent className="max-w-md">
                <CredenzaHeader>
                    <CredenzaTitle>Print Recipe</CredenzaTitle>
                    <CredenzaDescription>
                        Choose what to include, then print or save as PDF from
                        your browser.
                    </CredenzaDescription>
                </CredenzaHeader>

                <CredenzaBody className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="print-scale">Multiplier</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="print-scale"
                                type="number"
                                min={MIN_RECIPE_SCALE}
                                max={MAX_RECIPE_SCALE}
                                step={0.25}
                                value={options.scale}
                                onChange={(e) => {
                                    const parsed = parseFloat(e.target.value);
                                    updateOption(
                                        "scale",
                                        clampRecipeScale(
                                            isNaN(parsed) ? 1 : parsed
                                        )
                                    );
                                }}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                                ×
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SCALE_PRESETS.map((preset) => (
                                <Button
                                    key={preset}
                                    type="button"
                                    variant={
                                        options.scale === preset
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        updateOption("scale", preset)
                                    }
                                >
                                    {preset}×
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Include</p>
                        <div className="grid gap-2">
                            <SectionToggle
                                id="print-photos"
                                label="Hero photo"
                                checked={options.photos}
                                onCheckedChange={(checked) =>
                                    updateOption("photos", checked)
                                }
                            />
                            <SectionToggle
                                id="print-nutrition"
                                label="Nutrition label"
                                checked={options.nutrition}
                                onCheckedChange={(checked) => {
                                    updateOption("nutrition", checked);
                                    if (!checked) {
                                        updateOption("nutritionOwnPage", false);
                                    }
                                }}
                            />
                            {options.nutrition && (
                                <div className="ml-6">
                                    <SectionToggle
                                        id="print-nutrition-own-page"
                                        label="Nutrition label on its own page"
                                        checked={options.nutritionOwnPage}
                                        onCheckedChange={(checked) =>
                                            updateOption(
                                                "nutritionOwnPage",
                                                checked
                                            )
                                        }
                                    />
                                </div>
                            )}
                            <SectionToggle
                                id="print-description"
                                label="Description"
                                checked={options.description}
                                onCheckedChange={(checked) =>
                                    updateOption("description", checked)
                                }
                            />
                            <SectionToggle
                                id="print-metadata"
                                label="Metadata (times, yield, diet, links)"
                                checked={options.metadata}
                                onCheckedChange={(checked) =>
                                    updateOption("metadata", checked)
                                }
                            />
                            <SectionToggle
                                id="print-equipment"
                                label="Equipment"
                                checked={options.equipment}
                                onCheckedChange={(checked) =>
                                    updateOption("equipment", checked)
                                }
                            />
                            <SectionToggle
                                id="print-instructions"
                                label="Instructions"
                                checked={options.instructions}
                                onCheckedChange={(checked) =>
                                    updateOption("instructions", checked)
                                }
                            />
                            {showNotesOption && (
                                <SectionToggle
                                    id="print-notes"
                                    label="Personal notes"
                                    checked={options.notes}
                                    onCheckedChange={(checked) =>
                                        updateOption("notes", checked)
                                    }
                                />
                            )}
                        </div>
                    </div>
                </CredenzaBody>

                <CredenzaFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenPrintView}
                    >
                        Open print view
                    </Button>
                    <Button type="button" onClick={handlePrintNow}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print now
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}
