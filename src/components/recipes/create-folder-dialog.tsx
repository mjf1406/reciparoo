/** @format */

"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { id } from "@instantdb/react";
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

interface CreateFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    homeId: string;
    parentFolderId?: string | null;
    onSuccess?: () => void;
}

export function CreateFolderDialog({
    open,
    onOpenChange,
    homeId,
    parentFolderId,
    onSuccess,
}: CreateFolderDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const folderId = id();
            const now = new Date();

            // Build transaction - chain methods as they return new transaction objects
            let tx = db.tx.folders[folderId]
                .create({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    created: now,
                    updated: now,
                })
                .link({ home: homeId });

            // Link to parent folder if provided
            if (parentFolderId) {
                tx = tx.link({ parentFolder: parentFolderId });
            }

            await db.transact(tx);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Close dialog and reset form
            onOpenChange(false);
            setName("");
            setDescription("");
            onSuccess?.();
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Failed to create folder. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza
            open={open}
            onOpenChange={onOpenChange}
        >
            <CredenzaContent>
                <form onSubmit={handleSubmit}>
                    <CredenzaHeader>
                        <CredenzaTitle>Create a New Folder</CredenzaTitle>
                        <CredenzaDescription>
                            Give your folder a name and optional description. You
                            can organize your recipes into folders and subfolders.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Folder Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Desserts, Main Courses"
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
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
                            {isLoading ? "Creating..." : "Create Folder"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
