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

type Folder = InstaQLEntity<
    AppSchema,
    "folders",
    { home: {}; parentFolder: {} }
>;

interface MoveFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folder: Folder;
    homeId: string;
    onSuccess?: () => void;
}

export function MoveFolderDialog({
    open,
    onOpenChange,
    folder,
    homeId,
    onSuccess,
}: MoveFolderDialogProps) {
    const [selectedParentId, setSelectedParentId] = useState<string | null>(
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

    // Pre-populate form when folder changes or dialog opens
    useEffect(() => {
        if (folder?.parentFolder?.id) {
            setSelectedParentId(folder.parentFolder.id);
        } else {
            setSelectedParentId(null);
        }
    }, [folder, open]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!folder?.id) return;

        setIsLoading(true);
        try {
            // Build transaction - chain methods as they return new transaction objects
            let tx = db.tx.folders[folder.id];

            // If there's an existing parent folder link, unlink it first
            if (folder.parentFolder?.id) {
                tx = tx.unlink({ parentFolder: folder.parentFolder.id });
            }

            // Link to new parent if one is selected
            if (selectedParentId) {
                tx = tx.link({ parentFolder: selectedParentId });
            }

            await db.transact(tx);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Close dialog
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error moving folder:", error);
            alert("Failed to move folder. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    type FolderItem = {
        id: string;
        name: string;
        parentFolder?: { id: string } | null;
    };

    // Build folder tree for display, excluding the current folder and its descendants
    const buildFolderTree = (
        folderList: FolderItem[],
        excludeId: string,
        parentId: string | null = null,
        level: number = 0
    ): Array<{ id: string; name: string; level: number }> => {
        const result: Array<{ id: string; name: string; level: number }> = [];
        const children = folderList.filter(
            (f: FolderItem) =>
                f.id !== excludeId && (f.parentFolder?.id || null) === parentId
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
                excludeId,
                folder.id,
                level + 1
            );
            result.push(...subfolders);
        }

        return result;
    };

    const folderTree = buildFolderTree(folders, folder?.id || "");

    return (
        <Credenza
            open={open}
            onOpenChange={onOpenChange}
        >
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Move Folder</CredenzaTitle>
                        <CredenzaDescription>
                            Select a parent folder to move this folder to, or
                            move it to the root level.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent-folder-select">
                                    Parent Folder
                                </Label>
                                <Select
                                    value={selectedParentId || "root"}
                                    onValueChange={(value) =>
                                        setSelectedParentId(
                                            value === "root" ? null : value
                                        )
                                    }
                                    disabled={isLoading || foldersLoading}
                                >
                                    <SelectTrigger id="parent-folder-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="root">
                                            Root (No Parent)
                                        </SelectItem>
                                        {folderTree.map((f) => (
                                            <SelectItem
                                                key={f.id}
                                                value={f.id}
                                            >
                                                {"  ".repeat(f.level)}
                                                {f.name}
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
                            {isLoading ? "Moving..." : "Move Folder"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
