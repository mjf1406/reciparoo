/** @format */

"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { id } from "@instantdb/react";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import {
    Credenza,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateHomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateHomeDialog({
    open,
    onOpenChange,
}: CreateHomeDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuthContext();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim() || !user?.id) return;

        setIsLoading(true);
        try {
            const homeId = id();
            const now = new Date();

            db.transact(
                db.tx.homes[homeId]
                    .create({
                        name: name.trim(),
                        description: description.trim() || undefined,
                        created: now,
                        updated: now,
                    })
                    .link({ owner: user.id })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Close dialog and navigate
            onOpenChange(false);
            setName("");
            setDescription("");
            navigate({
                to: "/home/$homeId",
                params: { homeId },
            });
        } catch (error) {
            console.error("Error creating home:", error);
            alert("Failed to create home. Please try again.");
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
                        <CredenzaTitle>Create a New Home</CredenzaTitle>
                        <CredenzaDescription>
                            Give your home a name and optional description. You
                            can always change this later.
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Home Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Smith Family Kitchen"
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
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="A brief description of your home..."
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
                            {isLoading ? "Creating..." : "Create Home"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}
