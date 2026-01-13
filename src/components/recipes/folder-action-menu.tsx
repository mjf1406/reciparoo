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
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";
import { getUserRoleInHome } from "@/lib/utils";
import { EditFolderDialog } from "./edit-folder-dialog";
import { MoveFolderDialog } from "./move-folder-dialog";

type FolderWithRelations = InstaQLEntity<
    AppSchema,
    "folders",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
        };
        parentFolder: {};
    }
>;

interface FolderActionMenuProps {
    folder: FolderWithRelations;
    userId: string | null | undefined;
    onEdit?: () => void;
}

export function FolderActionMenu({ folder, userId, onEdit }: FolderActionMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get home from folder relation
    const home = folder.home;

    // Check permissions - only show menu for owner/admin/member
    const userRole = getUserRoleInHome(home ?? null, userId);
    const canEditFolder = userRole && userRole !== "viewer";

    // Don't render menu if user doesn't have permission
    if (!canEditFolder) {
        return null;
    }

    const handleDelete = async () => {
        if (!folder?.id) return;

        setIsDeleting(true);
        try {
            db.transact(db.tx.folders[folder.id].delete());

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting folder:", error);
            alert("Failed to delete folder. Please try again.");
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
                            setEditDialogOpen(true);
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
                        Move
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

            <EditFolderDialog
                folder={folder}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={() => {
                    setEditDialogOpen(false);
                    onEdit?.();
                }}
            />

            {home?.id && (
                <MoveFolderDialog
                    folder={folder}
                    homeId={home.id}
                    open={moveDialogOpen}
                    onOpenChange={setMoveDialogOpen}
                    onSuccess={() => {
                        setMoveDialogOpen(false);
                    }}
                />
            )}

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the folder "{folder.name}" and all its contents
                            (subfolders and recipes).
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
