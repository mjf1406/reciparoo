/** @format */

"use client";

import { useState } from "react";
import { Copy, Trash2, Check, Share2, Plus, Link } from "lucide-react";
import { db } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { generateInviteLink } from "@/lib/utils/join-codes";
import { CreateJoinCodeDialog } from "./create-join-code-dialog";
interface JoinCodesListProps {
    homeId: string;
}

export function JoinCodesList({ homeId }: JoinCodesListProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

    const { data } = db.useQuery({
        joinCodes: {
            $: {
                where: { "home.id": homeId },
                order: { created: "desc" },
            },
            home: {},
            joinCodeRequests: {},
        },
    });

    const joinCodes = data?.joinCodes || [];

    const handleDelete = async () => {
        if (!codeToDelete) return;

        setIsDeleting(true);
        try {
            db.transact(db.tx.joinCodes[codeToDelete].delete());

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setDeleteDialogOpen(false);
            setCodeToDelete(null);
        } catch (error) {
            console.error("Error deleting join code:", error);
            alert("Failed to delete join code. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopyCode = async (code: string, codeId: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCodeId(codeId);
            setTimeout(() => setCopiedCodeId(null), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleCopyLink = async (code: string, codeId: string) => {
        const link = generateInviteLink(code);
        try {
            await navigator.clipboard.writeText(link);
            setCopiedLinkId(codeId);
            setTimeout(() => setCopiedLinkId(null), 2000);
        } catch (error) {
            console.error("Failed to copy link:", error);
        }
    };

    const handleShare = async (code: string) => {
        const link = generateInviteLink(code);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Join my home on Reciparoo",
                    text: `Use this code to join: ${code}`,
                    url: link,
                });
            } catch (error) {
                // User cancelled or error occurred
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback to copy
            const codeId = joinCodes.find((jc) => jc.code === code)?.id;
            if (codeId) {
                handleCopyLink(code, codeId);
            }
        }
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "Unknown";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Invite Codes</CardTitle>
                            <CardDescription>
                                Manage invite codes for this home
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            size="sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Code
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {joinCodes.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>No invite codes yet.</p>
                            <p className="text-sm mt-2">
                                Create one to start inviting members.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {joinCodes.map((joinCode) => {
                                const requestCount =
                                    joinCode.joinCodeRequests?.length || 0;
                                return (
                                    <div
                                        key={joinCode.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-lg font-semibold">
                                                    {joinCode.code}
                                                </div>
                                                {requestCount > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {requestCount}{" "}
                                                        {requestCount === 1
                                                            ? "request"
                                                            : "requests"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Created{" "}
                                                {formatDate(joinCode.created)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleCopyCode(
                                                        joinCode.code,
                                                        joinCode.id
                                                    )
                                                }
                                                title="Copy code"
                                            >
                                                {copiedCodeId ===
                                                joinCode.id ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleCopyLink(
                                                        joinCode.code,
                                                        joinCode.id
                                                    )
                                                }
                                                title="Copy link"
                                            >
                                                {copiedLinkId ===
                                                joinCode.id ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Link className="h-4 w-4" />
                                                )}
                                            </Button>
                                            {typeof navigator.share === 'function' && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleShare(
                                                            joinCode.code
                                                        )
                                                    }
                                                    title="Share"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setCodeToDelete(
                                                        joinCode.id
                                                    );
                                                    setDeleteDialogOpen(true);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateJoinCodeDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                homeId={homeId}
            />

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invite Code?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this invite code. Any
                            pending requests associated with this code will also
                            be deleted. This action cannot be undone.
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
