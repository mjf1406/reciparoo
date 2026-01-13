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
import { getUserRoleInHome } from "@/lib/utils";
import { EditMealSlotDialog } from "./edit-meal-slot-dialog";
import type { MealSlotWithRelations } from "@/hooks/use-meal-slots";

interface MealSlotActionMenuProps {
    mealSlot: MealSlotWithRelations;
    userId: string | null | undefined;
    onEdit?: () => void;
}

export function MealSlotActionMenu({
    mealSlot,
    userId,
    onEdit,
}: MealSlotActionMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get home from mealSlot relation
    const home = mealSlot.mealPlan?.home;

    // Check permissions - only show menu for owner/admin/member
    const userRole = getUserRoleInHome(home ?? null, userId);
    const canEditMealSlot = userRole && userRole !== "viewer";

    // Don't render menu if user doesn't have permission
    if (!canEditMealSlot) {
        return null;
    }

    const handleDelete = async () => {
        if (!mealSlot?.id) return;

        setIsDeleting(true);
        try {
            db.transact(db.tx.mealSlots[mealSlot.id].delete());

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting meal slot:", error);
            alert("Failed to delete meal slot. Please try again.");
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
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
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
                            setEditDialogOpen(true);
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

            <EditMealSlotDialog
                mealSlot={mealSlot}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={() => {
                    setEditDialogOpen(false);
                    onEdit?.();
                }}
            />

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the meal/snack "{mealSlot.name}" and all its
                            recipe assignments.
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
