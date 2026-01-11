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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type Folder = InstaQLEntity<AppSchema, "folders">;

interface EditFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folder: Folder;
    onSuccess?: () => void;
}

export function EditFolderDialog({
    open,
    onOpenChange,
    folder,
    onSuccess,
}: EditFolderDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Pre-populate form when folder changes or dialog opens
    useEffect(() => {
        if (folder) {
            setName(folder.name || "");
            setDescription(folder.description || "");
        }
    }, [folder, open]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim() || !folder?.id) return;

        setIsLoading(true);
        try {
            const now = new Date();

            db.transact(
                db.tx.folders[folder.id].update({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    updated: now,
                })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Close dialog
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating folder:", error);
            alert("Failed to update folder. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={onOpenChange}>
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Edit Folder</CredenzaTitle>
                        <CredenzaDescription>
                            Update your folder's name and description.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-folder-name">Folder Name *</Label>
                                <Input
                                    id="edit-folder-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Desserts, Main Courses"
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-folder-description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="edit-folder-description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="A brief description of this folder..."
                                    rows={3}
                                    disabled={isLoading}
                                />
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
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
