/** @format */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import useHomeById from "@/hooks/use-home-by-id";
import { Loader2, BookOpen } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { db } from "@/lib/db/db";
import { id } from "@instantdb/react";

export const Route = createFileRoute("/home/$homeId/recipes/new")({
    component: NewRecipePage,
});

function NewRecipePage() {
    const { homeId } = Route.useParams();
    const { home, isLoading, error } = useHomeById(homeId!);
    const { user } = useAuthContext();
    const navigate = useNavigate();

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

    const homeName = (home as { name: string } | null)?.name || "Home";
    const userRole = getUserRoleInHome(home, user?.id);

    // Check if user can create recipes (owner or admin)
    const isOwnerOrAdmin =
        user?.id &&
        ((home as { owner?: { id: string } }).owner?.id === user.id ||
            (home as { admins?: Array<{ id: string }> }).admins?.some(
                (admin) => admin.id === user.id
            ));

    if (!isOwnerOrAdmin) {
        return (
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: "Home", to: "/" },
                        { label: homeName, to: `/home/${homeId}` },
                        { label: "Recipes", to: `/home/${homeId}/recipes` },
                        { label: "New Recipe" },
                    ]}
                    className="mb-6"
                    role={userRole}
                />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="text-destructive">
                        <p className="text-lg font-semibold mb-2">
                            Access Denied
                        </p>
                        <p>You must be an owner or admin to create recipes.</p>
                    </div>
                </div>
            </main>
        );
    }

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: {
        name: string;
        imageFile?: File;
        imageURL?: string;
        description?: string;
        diet?: string;
        prepTime?: number;
        cookTime?: number;
        ingredients: string;
        equipment: string;
        procedure: string;
        source?: string;
    }) => {
        setIsSubmitting(true);
        try {
            const recipeId = id();
            const now = new Date();

            let finalImageURL = formData.imageURL;

            // If we have a file, upload it, wait for ID, then fetch URL
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

                    // Step 3: Set owner and home fields on the file
                    const fileNow = new Date();
                    db.transact(
                        db.tx.$files[fileId].update({
                            owner: user.id,
                            home: homeId,
                            created: fileNow,
                            updated: fileNow,
                        })
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

            db.transact(
                db.tx.recipes[recipeId]
                    .create({
                        name: formData.name,
                        imageURL: finalImageURL,
                        description: formData.description,
                        diet: formData.diet,
                        prepTime: formData.prepTime,
                        cookTime: formData.cookTime,
                        ingredients: formData.ingredients,
                        equipment: formData.equipment,
                        procedure: formData.procedure,
                        source: formData.source,
                        created: now,
                        updated: now,
                    })
                    .link({ home: homeId })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Navigate back to recipes page
            navigate({
                to: "/home/$homeId/recipes",
                params: { homeId },
            });
        } catch (error) {
            console.error("Error creating recipe:", error);
            alert("Failed to create recipe. Please try again.");
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

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Recipes", to: `/home/${homeId}/recipes` },
                    { label: "New Recipe" },
                ]}
                className="mb-6"
                role={userRole}
            />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center">
                        <BookOpen className="w-8 h-8 mr-2 inline-block text-primary" />
                        Create New Recipe
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Fill in the details below to create a new recipe for{" "}
                        {homeName}.
                    </p>
                </div>

                <div className="bg-card border rounded-lg p-6">
                    <RecipeForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isSubmitting}
                    />
                </div>
            </div>
        </main>
    );
}
