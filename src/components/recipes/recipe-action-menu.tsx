/** @format */

"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/db/db";
import { useNavigate } from "@tanstack/react-router";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";
import { getUserRoleInHome } from "@/lib/utils";

type RecipeWithHome = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
        };
    }
>;

interface RecipeActionMenuProps {
    recipe: RecipeWithHome;
    userId: string | null | undefined;
}

export function RecipeActionMenu({ recipe, userId }: RecipeActionMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    // Get home from recipe relation
    const home = recipe.home;

    // Check permissions - only show menu for owner/admin/member
    const userRole = getUserRoleInHome(home ?? null, userId);
    const canEditRecipe = userRole && userRole !== "viewer";

    // Don't render menu if user doesn't have permission
    if (!canEditRecipe) {
        return null;
    }

    const handleEdit = () => {
        if (!home?.id || !recipe?.id) return;
        navigate({
            to: "/home/$homeId/recipes/$recipeId/edit",
            params: { homeId: home.id, recipeId: recipe.id },
        });
    };

    const handleDelete = async () => {
        if (!recipe?.id) return;

        setIsDeleting(true);
        try {
            db.transact(db.tx.recipes[recipe.id].delete());

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    }
                />
                <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit();
                        }}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialogOpen(true);
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the recipe "{recipe.name}" and all associated
                            data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
