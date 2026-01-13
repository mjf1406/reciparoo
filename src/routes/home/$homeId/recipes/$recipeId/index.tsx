/** @format */

import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useHomeById from "@/hooks/use-home-by-id";
import useRecipe from "@/hooks/use-recipe";
import {
    Loader2,
    BookOpen,
    Clock,
    Utensils,
    ExternalLink,
    RotateCcw,
    ChefHat,
    Scale,
    ChevronDown,
    Copy,
    Check,
    Share2,
    Play,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecipeTracking } from "@/hooks/use-recipe-tracking";
import { useRecipeScale } from "@/hooks/use-recipe-scale";
import { RecipeNotes } from "@/components/recipes/recipe-notes";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    generatePublicRecipeLink,
    copyRecipeLink,
    shareRecipe,
} from "@/lib/utils/recipe-sharing";

export const Route = createFileRoute("/home/$homeId/recipes/$recipeId/")({
    component: RecipeDetailPage,
});

interface Ingredient {
    quantity: string;
    unit: string;
    name: string;
}

interface ProcedureStep {
    step: number;
    instruction: string;
}

interface InstructionSection {
    title: string;
    steps: Array<{
        step: number;
        instruction: string;
    }>;
}

// Type guard to detect old format
function isOldFormat(data: any): data is ProcedureStep[] {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        "instruction" in data[0] &&
        !("title" in data[0])
    );
}

function RecipeDetailPage() {
    const { homeId, recipeId } = Route.useParams();
    const {
        home,
        isLoading: homeLoading,
        error: homeError,
    } = useHomeById(homeId!);
    const {
        recipe,
        isLoading: recipeLoading,
        error: recipeError,
    } = useRecipe(recipeId);
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [isNutritionLabelOpen, setIsNutritionLabelOpen] = React.useState(false);
    const [linkCopied, setLinkCopied] = React.useState(false);

    const isLoading = homeLoading || recipeLoading;
    const error = homeError || recipeError;

    // Parse recipe data
    const ingredients: Ingredient[] = recipe?.ingredients
        ? (JSON.parse(recipe.ingredients) as Ingredient[])
        : [];
    const equipment: string[] = recipe?.equipment
        ? (JSON.parse(recipe.equipment) as string[])
        : [];
    
    // Parse procedure - handle both old and new formats
    let procedureSteps: ProcedureStep[] = [];
    let instructionSections: InstructionSection[] = [];
    let isOldProcedureFormat = true;
    
    if (recipe?.procedure) {
        try {
            const parsed = JSON.parse(recipe.procedure);
            if (isOldFormat(parsed)) {
                procedureSteps = parsed;
                isOldProcedureFormat = true;
            } else {
                instructionSections = parsed as InstructionSection[];
                isOldProcedureFormat = false;
            }
        } catch (e) {
            // If parsing fails, treat as empty
            procedureSteps = [];
            instructionSections = [];
        }
    }

    // Parse diet types
    const dietTypes = recipe?.diet
        ? recipe.diet.split(",").map((d: string) => d.trim())
        : [];

    // Format time display
    const formatTime = (minutes?: number) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const prepTime = formatTime(recipe?.prepTime);
    const cookTime = formatTime(recipe?.cookTime);

    // Tracking hook
    const { toggleItem, resetSection, resetAll, isChecked } =
        useRecipeTracking(recipeId);

    // Scale hook
    const { scale, setScale, resetScale } = useRecipeScale(recipeId);

    // Convert decimal to fraction parts (whole, numerator, denominator)
    const decimalToFractionParts = (
        decimal: number
    ): { whole: number; num: number; den: number } | null => {
        // Check for whole numbers
        if (decimal % 1 === 0) {
            return { whole: decimal, num: 0, den: 1 };
        }

        // Try to find a simple fraction
        const tolerance = 0.001;
        for (let denom = 2; denom <= 16; denom++) {
            for (let num = 1; num < denom; num++) {
                const value = num / denom;
                if (Math.abs(decimal - value) < tolerance) {
                    // Simplify the fraction
                    const gcd = (a: number, b: number): number => {
                        return b === 0 ? a : gcd(b, a % b);
                    };
                    const divisor = gcd(num, denom);
                    const simplifiedNum = num / divisor;
                    const simplifiedDenom = denom / divisor;
                    return {
                        whole: 0,
                        num: simplifiedNum,
                        den: simplifiedDenom,
                    };
                }
            }
        }

        // Check for whole number + fraction
        const whole = Math.floor(decimal);
        const remainder = decimal - whole;
        if (whole > 0 && remainder > 0) {
            for (let denom = 2; denom <= 16; denom++) {
                for (let num = 1; num < denom; num++) {
                    const value = num / denom;
                    if (Math.abs(remainder - value) < tolerance) {
                        const gcd = (a: number, b: number): number => {
                            return b === 0 ? a : gcd(b, a % b);
                        };
                        const divisor = gcd(num, denom);
                        const simplifiedNum = num / divisor;
                        const simplifiedDenom = denom / divisor;
                        return {
                            whole,
                            num: simplifiedNum,
                            den: simplifiedDenom,
                        };
                    }
                }
            }
        }

        return null;
    };

    // Format a number as a nicely formatted fraction component
    const formatNumberAsFraction = (num: number): React.ReactNode => {
        const parts = decimalToFractionParts(num);

        if (!parts) {
            // If no simple fraction found, return formatted decimal
            return num.toFixed(2).replace(/\.?0+$/, "");
        }

        const { whole, num: numerator, den: denominator } = parts;

        if (denominator === 1) {
            // Whole number
            return whole.toString();
        }

        if (whole === 0) {
            // Just a fraction
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

        // Whole number + fraction
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
    };

    // Calculate scaled quantity with fraction formatting
    const getScaledQuantity = (quantity: string): React.ReactNode => {
        if (!quantity || quantity.trim() === "") return "";

        // Try to parse as number
        const num = parseFloat(quantity);
        if (isNaN(num)) return quantity; // Return original if not a number

        const scaled = num * scale;
        return formatNumberAsFraction(scaled);
    };

    // Format original quantity to fraction if it's a decimal
    const formatQuantity = (quantity: string): React.ReactNode => {
        if (!quantity || quantity.trim() === "") return "";

        const num = parseFloat(quantity);
        if (isNaN(num)) return quantity;

        return formatNumberAsFraction(num);
    };

    // Get scaled yield with fraction formatting
    const getScaledYield = (yieldValue: number): React.ReactNode => {
        const scaled = yieldValue * scale;
        return formatNumberAsFraction(scaled);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-4 h-4 ml-2 animate-spin" /> Loading...
            </div>
        );
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!home) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="text-center text-destructive">
                    <p>
                        Home with ID{" "}
                        <span className="inline font-bold italic text-foreground">
                            {homeId}
                        </span>{" "}
                        not found.
                    </p>
                    <br />
                    <p>
                        It either does not exist or you are not authorized to
                        access it.
                    </p>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="text-center text-destructive">
                    <p>
                        Recipe with ID{" "}
                        <span className="inline font-bold italic text-foreground">
                            {recipeId}
                        </span>{" "}
                        not found.
                    </p>
                    <br />
                    <p>
                        It either does not exist or you are not authorized to
                        access it.
                    </p>
                </div>
            </div>
        );
    }

    const homeName = (home as { name: string } | null)?.name || "Home";
    const userRole = getUserRoleInHome(home, user?.id);
    const canEditRecipe = userRole && userRole !== "viewer";

    // Share handlers
    const handleCopyLink = async () => {
        // Use public link for sharing
        const url = generatePublicRecipeLink(recipeId);
        try {
            await copyRecipeLink(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy link:", error);
        }
    };

    const handleShare = async () => {
        if (!recipe) return;
        // Use public link for sharing
        const url = generatePublicRecipeLink(recipeId);
        try {
            await shareRecipe(recipe.name || "Recipe", url);
            // If share falls back to copy, show the copied state
            if (!navigator.share) {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            }
        } catch (error) {
            console.error("Failed to share:", error);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Recipes", to: `/home/${homeId}/recipes` },
                    { label: recipe.name || "Recipe" },
                ]}
                className="mb-6"
                role={userRole}
            />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold flex items-center">
                                <BookOpen className="w-8 h-8 mr-2 inline-block text-primary" />
                                {recipe.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {canEditRecipe && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigate({
                                            to: "/home/$homeId/recipes/$recipeId/edit",
                                            params: { homeId, recipeId },
                                            search: {},
                                        });
                                    }}
                                >
                                    Edit Recipe
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyLink}
                                title="Copy link"
                            >
                                {linkCopied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                            {typeof navigator.share === "function" && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleShare}
                                    title="Share"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Recipe Image */}
                    {recipe.imageURL && (
                        <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg">
                            <ImageSkeleton
                                src={recipe.imageURL}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                                aspectRatio="16/9"
                            />
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        {dietTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {dietTypes.map(
                                    (diet: string, index: number) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {diet}
                                        </Badge>
                                    )
                                )}
                            </div>
                        )}
                        {(prepTime ||
                            cookTime ||
                            recipe.servingSize ||
                            recipe.servingUnit) && (
                            <div className="flex items-center gap-4 text-muted-foreground">
                                {prepTime && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Prep: {prepTime}</span>
                                    </div>
                                )}
                                {cookTime && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Cook: {cookTime}</span>
                                    </div>
                                )}
                                {(recipe.servingSize || recipe.servingUnit) && (
                                    <div className="flex items-center gap-1">
                                        <Utensils className="h-4 w-4" />
                                        <span>
                                            Serving Size:{" "}
                                            {recipe.servingSize
                                                ? `${recipe.servingSize}${
                                                      recipe.servingUnit
                                                          ? ` ${recipe.servingUnit}`
                                                          : ""
                                                  }`
                                                : recipe.servingUnit || ""}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        {recipe.source && (
                            <a
                                href={recipe.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span>View Source</span>
                            </a>
                        )}
                        {recipe.videoURL && (
                            <a
                                href={recipe.videoURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                <Play className="h-4 w-4" />
                                <span>Watch Video</span>
                            </a>
                        )}
                    </div>
                    {recipe.description && (
                        <p className="text-muted-foreground mt-2">
                            {recipe.description}
                        </p>
                    )}

                    {/* Created and Updated Timestamps */}
                    {(recipe.created || recipe.updated) && (
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t">
                            {recipe.created && (
                                <div>
                                    Created:{" "}
                                    {new Date(
                                        recipe.created
                                    ).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            )}
                            {recipe.updated && (
                                <div>
                                    Updated:{" "}
                                    {new Date(
                                        recipe.updated
                                    ).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Nutrition Label Image */}
                {recipe.nutritionLabelImageURL && (
                    <Collapsible
                        open={isNutritionLabelOpen}
                        onOpenChange={setIsNutritionLabelOpen}
                    >
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CollapsibleTrigger className="w-full cursor-pointer hover:bg-muted/50 transition-colors -m-6 p-6 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold">
                                            Nutrition Label
                                        </CardTitle>
                                        <ChevronDown
                                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                                                isNutritionLabelOpen
                                                    ? "transform rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 overflow-hidden">
                                <CardContent className="flex-1 flex items-center justify-center p-4 min-h-0">
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                                        <img
                                            src={recipe.nutritionLabelImageURL}
                                            alt={`${recipe.name} nutrition label`}
                                            className="max-w-full max-h-full w-auto h-auto object-contain"
                                        />
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )}

                {/* Global Reset Button */}
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetAll}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset All Tracking
                    </Button>
                </div>

                {/* Ingredients and Scale */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ingredients Section */}
                    {ingredients.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Utensils className="h-5 w-5" />
                                        Ingredients
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => resetSection("ingredients")}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {ingredients.map((ingredient, index) => {
                                        const checkboxId = `ingredient-${recipeId}-${index}`;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 py-2"
                                            >
                                                <Checkbox
                                                    id={checkboxId}
                                                    checked={isChecked(
                                                        "ingredients",
                                                        index
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleItem(
                                                            "ingredients",
                                                            index
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={checkboxId}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-medium">
                                                            {scale !== 1 ? (
                                                                <>
                                                                    <span className="text-muted-foreground line-through text-sm">
                                                                        {formatQuantity(
                                                                            ingredient.quantity
                                                                        )}
                                                                    </span>
                                                                    <span className="ml-1 text-primary font-semibold">
                                                                        {getScaledQuantity(
                                                                            ingredient.quantity
                                                                        )}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                formatQuantity(
                                                                    ingredient.quantity
                                                                )
                                                            )}{" "}
                                                            {ingredient.unit &&
                                                                ingredient.unit +
                                                                    " "}
                                                        </span>
                                                        <span>
                                                            {ingredient.name}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Scale Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5" />
                                Scale Recipe
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 flex-1">
                                        <Label
                                            htmlFor="scale-input"
                                            className="whitespace-nowrap"
                                        >
                                            Scale:
                                        </Label>
                                        <Input
                                            id="scale-input"
                                            type="number"
                                            min="0.25"
                                            max="10"
                                            step="0.25"
                                            value={scale}
                                            onChange={(e) => {
                                                const value = parseFloat(
                                                    e.target.value
                                                );
                                                if (!isNaN(value)) {
                                                    setScale(value);
                                                }
                                            }}
                                            className="w-24"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            x (0.25x - 10x)
                                        </span>
                                    </div>
                                    {scale !== 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetScale}
                                            className="flex items-center gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Reset to 1x
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        Quick scale:
                                    </span>
                                    <div className="flex gap-2">
                                        {[2, 3, 4, 5].map((multiplier) => (
                                            <Button
                                                key={multiplier}
                                                variant={
                                                    scale === multiplier
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setScale(multiplier)
                                                }
                                                className="min-w-12"
                                            >
                                                {multiplier}x
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                {/* Yield at bottom of scale card */}
                                {recipe.yield && (
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <Utensils className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    Yield:
                                                </span>
                                                <span className="text-sm">
                                                    {scale !== 1 ? (
                                                        <>
                                                            <span className="text-muted-foreground line-through">
                                                                {formatNumberAsFraction(
                                                                    recipe.yield
                                                                )}
                                                            </span>
                                                            <span className="ml-1 text-primary font-semibold">
                                                                {getScaledYield(
                                                                    recipe.yield
                                                                )}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        formatNumberAsFraction(
                                                            recipe.yield
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Equipment Section */}
                {equipment.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ChefHat className="h-5 w-5" />
                                    Equipment
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetSection("equipment")}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {equipment.map((eq, index) => {
                                    const checkboxId = `equipment-${recipeId}-${index}`;
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 py-2"
                                        >
                                            <Checkbox
                                                id={checkboxId}
                                                checked={isChecked(
                                                    "equipment",
                                                    index
                                                )}
                                                onCheckedChange={() =>
                                                    toggleItem(
                                                        "equipment",
                                                        index
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={checkboxId}
                                                className="flex-1 cursor-pointer"
                                            >
                                                {eq}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Procedure Section */}
                {(procedureSteps.length > 0 || instructionSections.length > 0) && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Instructions
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetSection("procedures")}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isOldProcedureFormat ? (
                                // Old format: flat list of steps
                                <div className="space-y-4">
                                    {procedureSteps.map((step, index) => {
                                        const checkboxId = `procedure-${recipeId}-${index}`;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3"
                                            >
                                                <Checkbox
                                                    id={checkboxId}
                                                    checked={isChecked(
                                                        "procedures",
                                                        index
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleItem(
                                                            "procedures",
                                                            index
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                                <label
                                                    htmlFor={checkboxId}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-semibold text-primary shrink-0">
                                                            {step.step}.
                                                        </span>
                                                        <p className="text-sm leading-relaxed">
                                                            {step.instruction}
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // New format: sections with steps
                                <div className="space-y-6">
                                    {instructionSections.map((section, sectionIndex) => {
                                        // Calculate global step index for tracking
                                        let globalStepIndex = 0;
                                        for (let i = 0; i < sectionIndex; i++) {
                                            globalStepIndex += instructionSections[i].steps.length;
                                        }
                                        
                                        return (
                                            <div key={sectionIndex} className="space-y-3">
                                                {section.title && (
                                                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                                                        {section.title}
                                                    </h3>
                                                )}
                                                <div className="space-y-4 pl-4">
                                                    {section.steps.map((step, stepIndex) => {
                                                        const currentGlobalIndex = globalStepIndex + stepIndex;
                                                        const checkboxId = `procedure-${recipeId}-${sectionIndex}-${stepIndex}`;
                                                        return (
                                                            <div
                                                                key={stepIndex}
                                                                className="flex items-start gap-3"
                                                            >
                                                                <Checkbox
                                                                    id={checkboxId}
                                                                    checked={isChecked(
                                                                        "procedures",
                                                                        currentGlobalIndex
                                                                    )}
                                                                    onCheckedChange={() =>
                                                                        toggleItem(
                                                                            "procedures",
                                                                            currentGlobalIndex
                                                                        )
                                                                    }
                                                                    className="mt-1"
                                                                />
                                                                <label
                                                                    htmlFor={checkboxId}
                                                                    className="flex-1 cursor-pointer"
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="font-semibold text-primary shrink-0">
                                                                            {step.step}.
                                                                        </span>
                                                                        <p className="text-sm leading-relaxed">
                                                                            {step.instruction}
                                                                        </p>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Notes Section */}
                <RecipeNotes recipeId={recipeId} />
            </div>
        </main>
    );
}
