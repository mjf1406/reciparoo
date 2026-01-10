/** @format */

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import useHomeById from "@/hooks/use-home-by-id";
import useHomeRecipes from "@/hooks/use-home-recipes";
import { Loader2, Plus, BookOpen } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { RecipeCard } from "@/components/recipes/recipe-card";

export const Route = createFileRoute("/home/$homeId/recipes")({
    component: RecipesPage,
});

function RecipesPage() {
    const { homeId } = Route.useParams();
    const { home, isLoading: homeLoading, error: homeError } = useHomeById(homeId!);
    const { recipes, isLoading: recipesLoading, error: recipesError } = useHomeRecipes(homeId!);
    const { user } = useAuthContext();
    const location = useLocation();

    const isLoading = homeLoading || recipesLoading;
    const error = homeError || recipesError;

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

    const handleCreateRecipe = () => {
        window.location.href = `/home/${homeId}/recipes/new`;
    };

    // If not on exact route, render child routes
    if (!isExactRoute) {
        return <Outlet />;
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Recipes" },
                ]}
                className="mb-6"
                role={userRole}
            />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <BookOpen className="w-8 h-8 mr-2 inline-block text-primary" />
                            Recipes
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {recipes.length === 0
                                ? "No recipes yet. Create your first recipe to get started!"
                                : `${recipes.length} recipe${recipes.length !== 1 ? "s" : ""} in this home`}
                        </p>
                    </div>
                    {canCreateRecipe && (
                        <Button onClick={handleCreateRecipe} size="lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Recipe
                        </Button>
                    )}
                </div>

                {recipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center border-2 border-dashed rounded-lg p-12">
                        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">No recipes yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Start building your recipe collection by creating your first
                            recipe.
                        </p>
                        {canCreateRecipe && (
                            <Button onClick={handleCreateRecipe} size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Recipe
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recipes.map((recipe: any) => (
                            <RecipeCard key={recipe.id} recipe={recipe as any} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
