/** @format */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import useRecipe from "@/hooks/use-recipe";
import { Loader2, BookOpen } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Navbar } from "@/components/layout/navbar";
import { useAuthContext } from "@/components/auth/auth-provider";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { db } from "@/lib/db/db";
import { LoginPage } from "@/components/auth/login-page";
import {
    getRecipeImageUrl,
    getRecipeNutritionImageUrl,
} from "@/lib/utils/recipe-image";

export const Route = createFileRoute("/_recipes/$recipeId/edit")({
    component: EditRecipePage,
});

async function uploadAndLinkFile(
    recipeId: string,
    file: File,
    linkKey: "imageFile" | "nutritionFile",
    pathPrefix: string
) {
    const filePath = `${pathPrefix}/${Date.now()}-${file.name}`;
    const { data } = await db.storage.uploadFile(filePath, file, {
        contentType: file.type,
    });
    if (!data?.id) {
        throw new Error("File upload did not return an ID");
    }
    await db.transact(db.tx.recipes[recipeId].link({ [linkKey]: data.id }));
}

function EditRecipePage() {
    const { recipeId } = Route.useParams();
    const { recipe, isLoading: recipeLoading, error: recipeError } = useRecipe(recipeId);
    const { canEdit, isLoading: authLoading } = useAuthContext();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = authLoading || recipeLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-4 h-4 ml-2 animate-spin" /> Loading...
            </div>
        );
    }

    if (!canEdit) {
        return <LoginPage />;
    }

    if (recipeError) {
        return <div>Error: {recipeError.message}</div>;
    }

    if (!recipe) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="text-center text-destructive">
                    <p>Recipe not found.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (formData: {
        name: string;
        imageFile?: File;
        nutritionLabelFile?: File;
        description?: string;
        diet?: string;
        prepTime?: number;
        cookTime?: number;
        yield?: number;
        servingSize?: number;
        servingUnit?: string;
        ingredients: string;
        equipment: string;
        procedure: string;
        source?: string;
        videoURL?: string;
    }) => {
        setIsSubmitting(true);
        try {
            const now = new Date();

            await db.transact(
                db.tx.recipes[recipeId].update({
                    name: formData.name,
                    description: formData.description,
                    diet: formData.diet,
                    prepTime: formData.prepTime,
                    cookTime: formData.cookTime,
                    yield: formData.yield,
                    servingSize: formData.servingSize,
                    servingUnit: formData.servingUnit,
                    ingredients: formData.ingredients,
                    equipment: formData.equipment,
                    procedure: formData.procedure,
                    source: formData.source,
                    videoURL: formData.videoURL,
                    updated: now,
                })
            );

            if (formData.imageFile) {
                await uploadAndLinkFile(
                    recipeId,
                    formData.imageFile,
                    "imageFile",
                    `recipes/${recipeId}`
                );
            }

            if (formData.nutritionLabelFile) {
                await uploadAndLinkFile(
                    recipeId,
                    formData.nutritionLabelFile,
                    "nutritionFile",
                    `recipes/${recipeId}/nutrition`
                );
            }

            navigate({ to: "/" });
        } catch (error) {
            console.error("Error updating recipe:", error);
            alert("Failed to update recipe. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const initialData = {
        name: recipe.name,
        imageURL: getRecipeImageUrl(recipe),
        nutritionLabelImageURL: getRecipeNutritionImageUrl(recipe),
        description: recipe.description,
        diet: recipe.diet,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        yield: recipe.yield,
        servingSize: recipe.servingSize,
        servingUnit: recipe.servingUnit,
        ingredients: recipe.ingredients,
        equipment: recipe.equipment,
        procedure: recipe.procedure,
        source: recipe.source,
        videoURL: recipe.videoURL,
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: "Home", to: "/" },
                        { label: "Recipes", to: "/" },
                        {
                            label: recipe.name || "Recipe",
                            to: `/${recipeId}`,
                        },
                        { label: "Edit" },
                    ]}
                    className="mb-6"
                />

                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center">
                            <BookOpen className="w-8 h-8 mr-2 inline-block text-primary" />
                            Edit Recipe
                        </h1>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                        <RecipeForm
                            onSubmit={handleSubmit}
                            onCancel={() => navigate({ to: "/" })}
                            isLoading={isSubmitting}
                            initialData={initialData}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
