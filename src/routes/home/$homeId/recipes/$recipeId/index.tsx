/** @format */

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
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRecipeTracking } from "@/hooks/use-recipe-tracking";
import { RecipeNotes } from "@/components/recipes/recipe-notes";

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

    const isLoading = homeLoading || recipeLoading;
    const error = homeError || recipeError;

    // Parse recipe data
    const ingredients: Ingredient[] = recipe?.ingredients
        ? (JSON.parse(recipe.ingredients) as Ingredient[])
        : [];
    const equipment: string[] = recipe?.equipment
        ? (JSON.parse(recipe.equipment) as string[])
        : [];
    const procedureSteps: ProcedureStep[] = recipe?.procedure
        ? (JSON.parse(recipe.procedure) as ProcedureStep[])
        : [];

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
                        {canEditRecipe && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigate({
                                        to: "/home/$homeId/recipes/$recipeId/edit",
                                        params: { homeId, recipeId },
                                    });
                                }}
                            >
                                Edit Recipe
                            </Button>
                        )}
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
                        {(prepTime || cookTime) && (
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
                                                <span className="font-medium">
                                                    {ingredient.quantity}{" "}
                                                    {ingredient.unit &&
                                                        ingredient.unit + " "}
                                                </span>
                                                <span>{ingredient.name}</span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                {procedureSteps.length > 0 && (
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
                        </CardContent>
                    </Card>
                )}

                {/* Notes Section */}
                <RecipeNotes recipeId={recipeId} />
            </div>
        </main>
    );
}
