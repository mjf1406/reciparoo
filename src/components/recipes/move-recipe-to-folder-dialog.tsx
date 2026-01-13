/** @format */

"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { db } from "@/lib/db/db";
import {
    Credenza,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/components/auth/auth-provider";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type Recipe = InstaQLEntity<AppSchema, "recipes", { home: {}; folder: {} }>;

interface MoveRecipeToFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: Recipe;
    homeId: string;
    onSuccess?: () => void;
}

export function MoveRecipeToFolderDialog({
    open,
    onOpenChange,
    recipe,
    homeId,
    onSuccess,
}: MoveRecipeToFolderDialogProps) {
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthContext();

    // Query all folders in the home
    const { data: foldersData, isLoading: foldersLoading } = db.useQuery(
        user?.id
            ? {
                  folders: {
                      $: {
                          where: { "home.id": homeId },
                      },
                      parentFolder: {},
                  },
              }
            : null
    );
    const folders = (foldersData?.folders || []) as Array<{
        id: string;
        name: string;
        parentFolder?: { id: string } | null;
    }>;

    // Pre-populate form when recipe changes or dialog opens
    useEffect(() => {
        if (recipe?.folder?.id) {
            setSelectedFolderId(recipe.folder.id);
        } else {
            setSelectedFolderId(null);
        }
    }, [recipe, open]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!recipe?.id) return;

        setIsLoading(true);
        try {
            // Build transaction - chain methods as they return new transaction objects
            let tx = db.tx.recipes[recipe.id];

            // If there's an existing folder link, unlink it first
            if (recipe.folder?.id) {
                tx = tx.unlink({ folder: recipe.folder.id });
            }

            // Link to new folder if one is selected
            if (selectedFolderId) {
                tx = tx.link({ folder: selectedFolderId });
            }

            await db.transact(tx);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Close dialog
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error moving recipe:", error);
            alert("Failed to move recipe. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    type FolderItem = {
        id: string;
        name: string;
        parentFolder?: { id: string } | null;
    };

    // Build folder tree for display
    const buildFolderTree = (
        folderList: FolderItem[],
        parentId: string | null = null,
        level: number = 0
    ): Array<{ id: string; name: string; level: number }> => {
        const result: Array<{ id: string; name: string; level: number }> = [];
        const children = folderList.filter(
            (f: FolderItem) => (f.parentFolder?.id || null) === parentId
        );

        for (const folder of children) {
            result.push({
                id: folder.id,
                name: folder.name,
                level,
            });
            // Recursively add subfolders
            const subfolders = buildFolderTree(
                folderList,
                folder.id,
                level + 1
            );
            result.push(...subfolders);
        }

        return result;
    };

    const folderTree = buildFolderTree(folders);

    return (
        <Credenza
            open={open}
            onOpenChange={onOpenChange}
        >
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Move Recipe to Folder</CredenzaTitle>
                        <CredenzaDescription>
                            Select a folder to move this recipe to, or leave it
                            at the root level.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="folder-select">Folder</Label>
                                <Select
                                    value={selectedFolderId || "root"}
                                    onValueChange={(value) =>
                                        setSelectedFolderId(
                                            value === "root" ? null : value
                                        )
                                    }
                                    disabled={isLoading || foldersLoading}
                                >
                                    <SelectTrigger id="folder-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="root">
                                            Root (No Folder)
                                        </SelectItem>
                                        {folderTree.map((folder) => (
                                            <SelectItem
                                                key={folder.id}
                                                value={folder.id}
                                            >
                                                {"  ".repeat(folder.level)}
                                                {folder.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CredenzaBody>
                    <CredenzaFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || foldersLoading}
                        >
                            {isLoading ? "Moving..." : "Move Recipe"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
