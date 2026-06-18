/** @format */

"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, FolderUp } from "lucide-react";
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
import { useAuthContext } from "@/components/auth/auth-provider";
import { MoveRecipeToFolderDialog } from "./move-recipe-to-folder-dialog";

type RecipeWithRelations = InstaQLEntity<
    AppSchema,
    "recipes",
    {
        folder: {};
        imageFile: {};
    }
>;

interface RecipeActionMenuProps {
    recipe: RecipeWithRelations;
}

export function RecipeActionMenu({ recipe }: RecipeActionMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const { canEdit } = useAuthContext();

    if (!canEdit) {
        return null;
    }

    const handleEdit = () => {
        if (!recipe?.id) return;
        navigate({
            to: "/recipes/$recipeId/edit",
            params: { recipeId: recipe.id },
        });
    };

    const handleDelete = async () => {
        if (!recipe?.id) return;

        setIsDeleting(true);
        try {
            db.transact(db.tx.recipes[recipe.id].delete());
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setMoveDialogOpen(true);
                        }}
                    >
                        <FolderUp className="mr-2 h-4 w-4" />
                        Move to Folder
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

            <MoveRecipeToFolderDialog
                open={moveDialogOpen}
                onOpenChange={setMoveDialogOpen}
                recipe={recipe}
                onSuccess={() => {
                    setMoveDialogOpen(false);
                }}
            />
        </>
    );
}
