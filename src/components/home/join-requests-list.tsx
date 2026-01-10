/** @format */

"use client";

import { useState } from "react";
import { Check, X, Mail } from "lucide-react";
import { db } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type JoinCodeRequest = InstaQLEntity<
    AppSchema,
    "joinCodeRequests",
    {
        joinCode: {
            home: {};
        };
        user: {};
    }
> & {
    created: Date | string | number;
    updated: Date | string | number;
};

interface JoinRequestsListProps {
    homeId: string;
}

export function JoinRequestsList({ homeId }: JoinRequestsListProps) {
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [denyDialogOpen, setDenyDialogOpen] = useState(false);
    const [requestToApprove, setRequestToApprove] =
        useState<JoinCodeRequest | null>(null);
    const [requestToDeny, setRequestToDeny] =
        useState<JoinCodeRequest | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Query all join code requests for join codes belonging to this home
    const { data } = db.useQuery({
        joinCodeRequests: {
            $: {
                where: { "joinCode.home.id": homeId },
                order: { created: "desc" },
            },
            joinCode: {
                home: {},
            },
            user: {},
        },
    });

    const requests = data?.joinCodeRequests || [];

    const handleApprove = async () => {
        if (!requestToApprove || !requestToApprove.user?.id) return;

        setIsProcessing(true);
        try {
            // Link user to home as a member (viewer role)
            // Note: We need to get the home entity to link to it
            // The homeMembers link is on homes, so we need to update the home
            const homeUpdateTx = db.tx.homes[homeId].link({
                homeMembers: requestToApprove.user.id,
            });

            // Delete the request
            const deleteRequestTx = db.tx.joinCodeRequests[
                requestToApprove.id
            ].delete();

            db.transact([homeUpdateTx, deleteRequestTx]);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setApproveDialogOpen(false);
            setRequestToApprove(null);
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeny = async () => {
        if (!requestToDeny || !requestToDeny.joinCode?.id || !requestToDeny.user?.id) return;

        setIsProcessing(true);
        try {
            // Link user to join code's denied relation
            const linkDeniedTx = db.tx.joinCodes[requestToDeny.joinCode.id].link({
                denied: requestToDeny.user.id,
            });

            // Delete the request
            const deleteRequestTx = db.tx.joinCodeRequests[requestToDeny.id].delete();

            db.transact([linkDeniedTx, deleteRequestTx]);

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setDenyDialogOpen(false);
            setRequestToDeny(null);
        } catch (error) {
            console.error("Error denying request:", error);
            alert("Failed to deny request. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "Unknown";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>
                        Review and approve or deny requests to join this home
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>No pending join requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div className="font-medium">
                                                {request.email}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Requested{" "}
                                            {formatDate(request.created)}
                                            {request.joinCode?.code && (
                                                <> • Code: {request.joinCode.code}</>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setRequestToApprove(request as JoinCodeRequest);
                                                setApproveDialogOpen(true);
                                            }}
                                            disabled={isProcessing}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setRequestToDeny(request as JoinCodeRequest);
                                                setDenyDialogOpen(true);
                                            }}
                                            disabled={isProcessing}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Deny
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will add{" "}
                            <strong>{requestToApprove?.email}</strong> as a
                            member (viewer) of this home. The request will be
                            removed from the list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {isProcessing ? "Approving..." : "Approve"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deny Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the join request from{" "}
                            <strong>{requestToDeny?.email}</strong>. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeny}
                            disabled={isProcessing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isProcessing ? "Denying..." : "Deny"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
