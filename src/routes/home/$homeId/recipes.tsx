/** @format */

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import useHomeById from "@/hooks/use-home-by-id";
import useHomeRecipes from "@/hooks/use-home-recipes";
import useHomeFolders from "@/hooks/use-home-folders";
import { Loader2, Plus, BookOpen, Folder } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { FolderCard } from "@/components/recipes/folder-card";
import { CreateFolderDialog } from "@/components/recipes/create-folder-dialog";
import { useState } from "react";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type FolderWithRelations = InstaQLEntity<
    AppSchema,
    "folders",
    {
        home: {};
        parentFolder: {};
    }
>;

export const Route = createFileRoute("/home/$homeId/recipes")({
    component: RecipesPage,
    validateSearch: (search: Record<string, unknown>): { folder?: string } => ({
        folder: (search.folder as string) || undefined,
    }),
});

function RecipesPage() {
    const { homeId } = Route.useParams();
    const { folder: folderId } = Route.useSearch();
    const { home, isLoading: homeLoading, error: homeError } = useHomeById(homeId!);
    const { recipes, isLoading: recipesLoading, error: recipesError } = useHomeRecipes(homeId!, folderId || null);
    const { folders, isLoading: foldersLoading, error: foldersError } = useHomeFolders(homeId!, folderId || null);
    const { user } = useAuthContext();
    const location = useLocation();
    const [createFolderOpen, setCreateFolderOpen] = useState(false);

    // Query current folder and build breadcrumb path
    const { data: folderData } = db.useQuery(
        folderId
            ? {
                  folders: {
                      $: { where: { id: folderId } },
                      home: {},
                      parentFolder: {},
                  },
              }
            : null
    );
    const currentFolder = folderData?.folders?.[0] as FolderWithRelations | undefined;

    // Build folder breadcrumb path
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

    const isLoading = homeLoading || recipesLoading || foldersLoading;
    const error = homeError || recipesError || foldersError;

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

    // Check if we're on the exact route (no child route) by comparing pathname
    const expectedPath = `/home/${homeId}/recipes`;
    const isExactRoute = location.pathname === expectedPath;

    // Check if user can create recipes (all roles except viewer)
    const canCreateRecipe = userRole && userRole !== "viewer";
    const canCreateFolder = userRole && userRole !== "viewer";

    const handleCreateRecipe = () => {
        window.location.href = `/home/${homeId}/recipes/new`;
    };

    // If not on exact route, render child routes
    if (!isExactRoute) {
        return <Outlet />;
    }

    // Build breadcrumb items
    const breadcrumbItems = [
        { label: "Home", to: "/" },
        { label: homeName, to: `/home/${homeId}` },
        { label: "Recipes", to: `/home/${homeId}/recipes` },
    ];

    // Add folder path to breadcrumb
    folderPath.forEach((folder) => {
        breadcrumbItems.push({
            label: folder.name,
            to: `/home/${homeId}/recipes?folder=${folder.id}`,
        });
    });

    const totalItems = folders.length + recipes.length;
    const isEmpty = totalItems === 0;

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={breadcrumbItems}
                className="mb-6"
                role={userRole}
            />

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
                                    : "No recipes yet. Create your first recipe to get started!"
                                : `${folders.length} folder${folders.length !== 1 ? "s" : ""}, ${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canCreateFolder && (
                            <Button
                                onClick={() => setCreateFolderOpen(true)}
                                size="lg"
                                variant="outline"
                            >
                                <Folder className="mr-2 h-4 w-4" />
                                Create Folder
                            </Button>
                        )}
                        {canCreateRecipe && (
                            <Button onClick={handleCreateRecipe} size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Recipe
                            </Button>
                        )}
                    </div>
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
                        <p className="text-muted-foreground mb-6 max-w-md">
                            {currentFolder
                                ? "Add recipes or create subfolders to organize your recipes."
                                : "Start building your recipe collection by creating your first recipe."}
                        </p>
                        <div className="flex gap-2">
                            {canCreateFolder && (
                                <Button
                                    onClick={() => setCreateFolderOpen(true)}
                                    size="lg"
                                    variant="outline"
                                >
                                    <Folder className="mr-2 h-4 w-4" />
                                    Create Folder
                                </Button>
                            )}
                            {canCreateRecipe && (
                                <Button onClick={handleCreateRecipe} size="lg">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Recipe
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {folders.map((folder: any) => (
                            <FolderCard key={folder.id} folder={folder} />
                        ))}
                        {recipes.map((recipe: any) => (
                            <RecipeCard key={recipe.id} recipe={recipe as any} />
                        ))}
                    </div>
                )}
            </div>

            <CreateFolderDialog
                open={createFolderOpen}
                onOpenChange={setCreateFolderOpen}
                homeId={homeId!}
                parentFolderId={folderId || null}
                onSuccess={() => {
                    setCreateFolderOpen(false);
                }}
            />
        </main>
    );
}
