/** @format */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import useHomeById from "@/hooks/use-home-by-id";
import useRecipe from "@/hooks/use-recipe";
import { Loader2, BookOpen } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { db } from "@/lib/db/db";

export const Route = createFileRoute("/home/$homeId/recipes/$recipeId/edit")({
    component: EditRecipePage,
});

function EditRecipePage() {
    const { homeId, recipeId } = Route.useParams();
    const { home, isLoading: homeLoading, error: homeError } = useHomeById(homeId!);
    const { recipe, isLoading: recipeLoading, error: recipeError } = useRecipe(recipeId);
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = homeLoading || recipeLoading;
    const error = homeError || recipeError;

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

    // Check if user can edit recipes (all roles except viewer)
    const canEditRecipe = userRole && userRole !== "viewer";

    if (!canEditRecipe) {
        return (
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: "Home", to: "/" },
                        { label: homeName, to: `/home/${homeId}` },
                        { label: "Recipes", to: `/home/${homeId}/recipes` },
                        { label: recipe.name || "Recipe", to: `/home/${homeId}/recipes/${recipeId}` },
                        { label: "Edit" },
                    ]}
                    className="mb-6"
                    role={userRole}
                />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="text-destructive">
                        <p className="text-lg font-semibold mb-2">
                            Access Denied
                        </p>
                        <p>You must be an owner, admin, or member to edit recipes. Viewers can only view recipes.</p>
                    </div>
                </div>
            </main>
        );
    }

    const handleSubmit = async (formData: {
        name: string;
        imageFile?: File;
        imageURL?: string;
        nutritionLabelFile?: File;
        nutritionLabelImageURL?: string;
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
    }) => {
        setIsSubmitting(true);
        try {
            const now = new Date();

            // Start with existing image URL, will be updated if new file is uploaded
            let finalImageURL = recipe.imageURL;
            let finalNutritionLabelImageURL = recipe.nutritionLabelImageURL;

            // If we have a new file, upload it, wait for ID, then fetch URL
            if (formData.imageFile && user?.id) {
                try {
                    // Step 1: Upload the file
                    const filePath = `recipes/${recipeId}/${Date.now()}-${formData.imageFile.name}`;
                    const uploadResult = await db.storage.uploadFile(
                        filePath,
                        formData.imageFile
                    );

                    // Step 2: Get the file ID from upload response
                    const fileId = uploadResult?.data?.id;

                    if (!fileId) {
                        throw new Error("File upload did not return an ID");
                    }

                    // Step 3: Set owner and home links on the file using chained links
                    const fileNow = new Date();
                    db.transact(
                        db.tx.$files[fileId]
                            .update({
                                created: fileNow,
                                updated: fileNow,
                            })
                            .link({ owner: user.id })
                            .link({ home: homeId })
                    );

                    // Step 4: Wait a moment for the file to be available in the database
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // Step 5: Fetch the file from $files entity to get the URL
                    let fileData = null;
                    let retries = 3;

                    while (retries > 0 && !fileData?.$files?.[0]?.url) {
                        try {
                            const result = await db.queryOnce({
                                $files: {
                                    $: { where: { id: fileId } },
                                },
                            });

                            if (result?.data?.$files?.[0]?.url) {
                                fileData = result.data;
                                break;
                            }
                        } catch (error) {
                            console.warn("Error fetching file:", error);
                        }

                        // Wait before retrying
                        if (retries > 1) {
                            await new Promise((resolve) =>
                                setTimeout(resolve, 500)
                            );
                        }
                        retries--;
                    }

                    if (fileData?.$files?.[0]?.url) {
                        finalImageURL = fileData.$files[0].url;
                        console.log(
                            "Fetched file URL from $files:",
                            finalImageURL
                        );
                    } else {
                        console.error(
                            "File URL not found in $files entity after retries"
                        );
                        alert(
                            "Failed to retrieve uploaded image URL. Please try again."
                        );
                        return;
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    alert("Failed to upload image. Please try again.");
                    return;
                }
            }

            // If we have a new nutrition label file, upload it, wait for ID, then fetch URL
            if (formData.nutritionLabelFile && user?.id) {
                try {
                    // Step 1: Upload the file
                    const filePath = `recipes/${recipeId}/nutrition-label-${Date.now()}-${formData.nutritionLabelFile.name}`;
                    const uploadResult = await db.storage.uploadFile(
                        filePath,
                        formData.nutritionLabelFile
                    );

                    // Step 2: Get the file ID from upload response
                    const fileId = uploadResult?.data?.id;

                    if (!fileId) {
                        throw new Error("File upload did not return an ID");
                    }

                    // Step 3: Set owner and home links on the file using chained links
                    const fileNow = new Date();
                    db.transact(
                        db.tx.$files[fileId]
                            .update({
                                created: fileNow,
                                updated: fileNow,
                            })
                            .link({ owner: user.id })
                            .link({ home: homeId })
                    );

                    // Step 4: Wait a moment for the file to be available in the database
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // Step 5: Fetch the file from $files entity to get the URL
                    let fileData = null;
                    let retries = 3;

                    while (retries > 0 && !fileData?.$files?.[0]?.url) {
                        try {
                            const result = await db.queryOnce({
                                $files: {
                                    $: { where: { id: fileId } },
                                },
                            });

                            if (result?.data?.$files?.[0]?.url) {
                                fileData = result.data;
                                break;
                            }
                        } catch (error) {
                            console.warn("Error fetching file:", error);
                        }

                        // Wait before retrying
                        if (retries > 1) {
                            await new Promise((resolve) =>
                                setTimeout(resolve, 500)
                            );
                        }
                        retries--;
                    }

                    if (fileData?.$files?.[0]?.url) {
                        finalNutritionLabelImageURL = fileData.$files[0].url;
                        console.log(
                            "Fetched nutrition label file URL from $files:",
                            finalNutritionLabelImageURL
                        );
                    } else {
                        console.error(
                            "Nutrition label file URL not found in $files entity after retries"
                        );
                        alert(
                            "Failed to retrieve uploaded nutrition label image URL. Please try again."
                        );
                        return;
                    }
                } catch (error) {
                    console.error("Error uploading nutrition label image:", error);
                    alert("Failed to upload nutrition label image. Please try again.");
                    return;
                }
            }

            // Update the recipe, preserving created timestamp
            db.transact(
                db.tx.recipes[recipeId]
                    .update({
                        name: formData.name,
                        imageURL: finalImageURL,
                        nutritionLabelImageURL: finalNutritionLabelImageURL,
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
                        updated: now,
                        // Note: created timestamp is preserved automatically by InstantDB
                    })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Navigate back to recipes page
            navigate({
                to: "/home/$homeId/recipes",
                params: { homeId },
            });
        } catch (error) {
            console.error("Error updating recipe:", error);
            alert("Failed to update recipe. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate({
            to: "/home/$homeId/recipes",
            params: { homeId },
        });
    };

    // Prepare initial data for the form
    const initialData = {
        name: recipe.name,
        imageURL: recipe.imageURL,
        nutritionLabelImageURL: recipe.nutritionLabelImageURL,
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
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Recipes", to: `/home/${homeId}/recipes` },
                    { label: recipe.name || "Recipe", to: `/home/${homeId}/recipes/${recipeId}` },
                    { label: "Edit" },
                ]}
                className="mb-6"
                role={userRole}
            />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center">
                        <BookOpen className="w-8 h-8 mr-2 inline-block text-primary" />
                        Edit Recipe
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Update the details below to modify this recipe in{" "}
                        {homeName}.
                    </p>
                </div>

                <div className="bg-card border rounded-lg p-6">
                    <RecipeForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isSubmitting}
                        initialData={initialData}
                    />
                </div>
            </div>
        </main>
    );
}
