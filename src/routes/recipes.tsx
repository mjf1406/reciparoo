/** @format */

import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import useRecipes from "@/hooks/use-recipes";
import useFolders from "@/hooks/use-folders";
import { Loader2, Plus, BookOpen, Folder } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/auth-provider";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { FolderCard } from "@/components/recipes/folder-card";
import { CreateFolderDialog } from "@/components/recipes/create-folder-dialog";
import { Navbar } from "@/components/layout/navbar";
import { useState } from "react";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type FolderWithRelations = InstaQLEntity<
    AppSchema,
    "folders",
    {
        parentFolder: {};
    }
>;

export const Route = createFileRoute("/recipes")({
    component: RecipesPage,
    validateSearch: (search: Record<string, unknown>): { folder?: string } => ({
        folder: (search.folder as string) || undefined,
    }),
});

function RecipesPage() {
    const { folder: folderId } = Route.useSearch();
    const { recipes, isLoading: recipesLoading, error: recipesError } = useRecipes(folderId || null);
    const { folders, isLoading: foldersLoading, error: foldersError } = useFolders(folderId || null);
    const { canEdit } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [createFolderOpen, setCreateFolderOpen] = useState(false);

    const { data: folderData } = db.useQuery(
        folderId
            ? {
                  folders: {
                      $: { where: { id: folderId } },
                      parentFolder: {},
                  },
              }
            : null
    );
    const currentFolder = folderData?.folders?.[0] as FolderWithRelations | undefined;

    const buildFolderPath = (folder: FolderWithRelations | undefined): FolderWithRelations[] => {
        if (!folder) return [];
        const path: FolderWithRelations[] = [];
        let current: FolderWithRelations | undefined = folder;
        while (current) {
            path.unshift(current);
            current = current.parentFolder as FolderWithRelations | undefined;
        }
        return path;
    };

    const folderPath = buildFolderPath(currentFolder);

    const isLoading = recipesLoading || foldersLoading;
    const error = recipesError || foldersError;

    const expectedPath = "/recipes";
    const isExactRoute = location.pathname === expectedPath;

    if (!isExactRoute) {
        return <Outlet />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" /> Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: "Home", to: "/" },
        { label: "Recipes", to: "/recipes" },
    ];

    folderPath.forEach((folder) => {
        breadcrumbItems.push({
            label: folder.name,
            to: `/recipes?folder=${folder.id}`,
        });
    });

    const totalItems = folders.length + recipes.length;
    const isEmpty = totalItems === 0;

    const handleCreateRecipe = () => {
        navigate({ to: "/recipes/new" });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb items={breadcrumbItems} className="mb-6" />

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center">
                                {currentFolder ? (
                                    <Folder className="w-8 h-8 mr-2 inline-block text-primary" />
                                ) : (
                                    <BookOpen className="w-8 h-8 mr-2 inline-block text-primary" />
                                )}
                                {currentFolder ? currentFolder.name : "Recipes"}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {isEmpty
                                    ? currentFolder
                                        ? "This folder is empty"
                                        : "No recipes yet."
                                    : `${folders.length} folder${folders.length !== 1 ? "s" : ""}, ${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        {canEdit && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setCreateFolderOpen(true)}
                                    size="lg"
                                    variant="outline"
                                >
                                    <Folder className="mr-2 h-4 w-4" />
                                    Create Folder
                                </Button>
                                <Button onClick={handleCreateRecipe} size="lg">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Recipe
                                </Button>
                            </div>
                        )}
                    </div>

                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center border-2 border-dashed rounded-lg p-12">
                            {currentFolder ? (
                                <Folder className="w-16 h-16 text-muted-foreground mb-4" />
                            ) : (
                                <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                            )}
                            <h2 className="text-2xl font-semibold mb-2">
                                {currentFolder ? "This folder is empty" : "No recipes yet"}
                            </h2>
                            {canEdit && (
                                <div className="flex gap-2 mt-6">
                                    <Button
                                        onClick={() => setCreateFolderOpen(true)}
                                        size="lg"
                                        variant="outline"
                                    >
                                        <Folder className="mr-2 h-4 w-4" />
                                        Create Folder
                                    </Button>
                                    <Button onClick={handleCreateRecipe} size="lg">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Recipe
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {folders.map((folder: any) => (
                                <FolderCard key={folder.id} folder={folder} />
                            ))}
                            {recipes.map((recipe: any) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    )}
                </div>

                <CreateFolderDialog
                    open={createFolderOpen}
                    onOpenChange={setCreateFolderOpen}
                    parentFolderId={folderId || null}
                    onSuccess={() => setCreateFolderOpen(false)}
                />
            </main>
        </div>
    );
}
