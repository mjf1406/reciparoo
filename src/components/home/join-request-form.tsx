/** @format */

"use client";

import { useState, type FormEvent } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/db/db";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface JoinRequestFormProps {
    code: string;
    joinCodeId: string;
    homeId: string;
}

export function JoinRequestForm({
    joinCodeId,
    homeId,
}: JoinRequestFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthContext();

    // Use user's email (read-only)
    const email = user?.email || "";

    // Check if user already has a pending request for this code (reactive query)
    const { data: existingRequestData } = db.useQuery(
        (user?.id && joinCodeId
            ? {
                  joinCodeRequests: {
                      $: {
                          where: {
                              and: [
                                  { "joinCode.id": joinCodeId },
                                  { "user.id": user.id },
                              ],
                          },
                      },
                  },
              }
            : null) as any
    );

    const hasExistingRequest =
        ((existingRequestData as any)?.joinCodeRequests?.length || 0) > 0;

    // Check if user is already a member of this home
    const { data: homeData } = db.useQuery(
        (user?.id
            ? {
                  homes: {
                      $: {
                          where: {
                              and: [
                                  { id: homeId },
                                  {
                                      or: [
                                          { "owner.id": user.id },
                                          { "admins.id": user.id },
                                          { "homeMembers.id": user.id },
                                          { "viewers.id": user.id },
                                      ],
                                  },
                              ],
                          },
                      },
                  },
              }
            : null) as any
    );

    const isAlreadyMember = ((homeData as any)?.homes?.length || 0) > 0;

    // Don't show "Already a Member" if user just became a member (was accepted)
    // The parent component will handle showing the acceptance message
    // Check if user was just accepted: has submission flag, is member, no pending request
    const submissionKey = `join_request_${joinCodeId}_${user?.id || ""}`;
    const hasSubmissionFlag = submissionKey && user?.id
        ? localStorage.getItem(submissionKey) === "true"
        : false;
    const wasJustAccepted = hasSubmissionFlag && isAlreadyMember && !hasExistingRequest;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim() || !user?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            // Check if email already has a request for this code
            const { data: emailCheck } = await db.queryOnce({
                joinCodeRequests: {
                    $: {
                        where: {
                            and: [
                                { "joinCode.id": joinCodeId },
                                { email: email.trim() },
                            ],
                        },
                    },
                },
            });

            if ((emailCheck as any)?.joinCodeRequests?.length > 0) {
                setError(
                    "A request with this email already exists for this code."
                );
                setIsLoading(false);
                return;
            }

            const now = new Date();
            const requestId = id();

            db.transact(
                db.tx.joinCodeRequests[requestId]
                    .create({
                        email: email.trim(),
                        created: now,
                        updated: now,
                    })
                    .link({ joinCode: joinCodeId })
                    .link({ user: user.id })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Store in localStorage that user submitted a request for this code
            const submissionKey = `join_request_${joinCodeId}_${user.id}`;
            localStorage.setItem(submissionKey, "true");

            // Don't set success state - let the reactive query handle showing pending status
            // The parent component will handle showing accepted/denied states
        } catch (error) {
            console.error("Error submitting join request:", error);
            setError(
                "Failed to submit join request. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Only show "Already a Member" if they were a member BEFORE submitting (not just accepted)
    if (isAlreadyMember && !wasJustAccepted) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Already a Member</CardTitle>
                    <CardDescription>
                        You are already a member of this home.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (hasExistingRequest) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Request Pending</CardTitle>
                    <CardDescription>
                        You have already submitted a join request for this code.
                        Please wait for the home owner or admin to approve your
                        request. Stay on this page to see updates.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request to Join</CardTitle>
                <CardDescription>
                    Submit a request to join this home. You'll be added as a
                    viewer (member) if approved.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            disabled={isLoading || !email}
                            className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            The home owner or admin will see your email address
                            and needs it to approve your request.
                        </p>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || !email.trim()}
                        className="w-full"
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </Button>
                    {!email && (
                        <p className="text-xs text-muted-foreground text-center">
                            Please sign in to submit a join request.
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
