/** @format */

"use client";

import { useState, useEffect } from "react";
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
import { generateJoinCode, generateInviteLink } from "@/lib/utils/join-codes";
import { Copy, Check, Share2 } from "lucide-react";

interface CreateJoinCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    homeId: string;
}

export function CreateJoinCodeDialog({
    open,
    onOpenChange,
    homeId,
}: CreateJoinCodeDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Query existing codes to check uniqueness
    const { data } = db.useQuery({
        joinCodes: {
            $: {
                where: { "home.id": homeId },
            },
        },
    });

    const existingCodes = data?.joinCodes?.map((jc) => jc.code) || [];

    const generateUniqueCode = (): string => {
        let code = generateJoinCode(6);
        let attempts = 0;
        while (existingCodes.includes(code) && attempts < 10) {
            code = generateJoinCode(6);
            attempts++;
        }
        return code;
    };

    const handleCreate = async () => {
        if (!homeId) return;

        setIsLoading(true);
        try {
            const code = generateUniqueCode();
            const now = new Date();
            const codeId = id();

            db.transact(
                db.tx.joinCodes[codeId]
                    .create({
                        code,
                        created: now,
                        updated: now,
                    })
                    .link({ home: homeId })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setGeneratedCode(code);
        } catch (error) {
            console.error("Error creating join code:", error);
            alert("Failed to create join code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (!generatedCode) return;
        try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleCopyLink = async () => {
        if (!generatedCode) return;
        const link = generateInviteLink(generatedCode);
        try {
            await navigator.clipboard.writeText(link);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy link:", error);
        }
    };

    const handleShare = async () => {
        if (!generatedCode) return;
        const link = generateInviteLink(generatedCode);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Join my home on Reciparoo",
                    text: `Use this code to join: ${generatedCode}`,
                    url: link,
                });
            } catch (error) {
                // User cancelled or error occurred
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback to copy
            handleCopyLink();
        }
    };

    // Reset when dialog closes
    useEffect(() => {
        if (!open) {
            setGeneratedCode(null);
            setCopied(false);
            setLinkCopied(false);
        }
    }, [open]);

    return (
        <Credenza
            open={open}
            onOpenChange={onOpenChange}
        >
            <CredenzaContent>
                <CredenzaHeader>
                    <CredenzaTitle>Create Invite Code</CredenzaTitle>
                    <CredenzaDescription>
                        Generate a unique code that others can use to request
                        access to this home. They will be added as viewers
                        (members) when approved.
                    </CredenzaDescription>
                </CredenzaHeader>
                <CredenzaBody className="overflow-hidden">
                    {!generatedCode ? (
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Click the button below to generate a new invite
                                code.
                            </p>
                        </div>
                    ) : (
                        <div className="min-w-0 space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Invite Code
                                </label>
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-input bg-background px-3 py-2 font-mono text-lg font-semibold">
                                        {generatedCode}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyCode}
                                        className="shrink-0"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Invite Link
                                </label>
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground truncate">
                                        {generateInviteLink(generatedCode)}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyLink}
                                        className="shrink-0"
                                    >
                                        {linkCopied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                    {typeof navigator.share === 'function' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={handleShare}
                                            className="shrink-0"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CredenzaBody>
                <CredenzaFooter>
                    {!generatedCode ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreate}
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating..." : "Generate Code"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="w-full"
                        >
                            Done
                        </Button>
                    )}
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}
