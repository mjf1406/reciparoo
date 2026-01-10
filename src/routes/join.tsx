/** @format */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { LoginPage } from "@/components/auth/login-page";
import { Navbar } from "@/components/layout/navbar";
import { db } from "@/lib/db/db";
import { JoinRequestForm } from "@/components/home/join-request-form";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/join")({
    component: JoinPage,
    validateSearch: (search: Record<string, unknown>) => ({
        code: (search.code as string) || undefined,
    }),
});

function JoinPage() {
    const { code } = Route.useSearch();
    const { user, isLoading: authLoading } = useAuthContext();
    const navigate = useNavigate();

    // Query join code with home and denied users
    const {
        data,
        isLoading: codeLoading,
        error,
    } = db.useQuery(
        code
            ? {
                  joinCodes: {
                      $: { where: { code: code.toUpperCase() } },
                      home: {
                          owner: {},
                          admins: {},
                          homeMembers: {},
                      },
                      denied: {},
                      joinCodeRequests: {
                          user: {},
                      },
                  },
              }
            : null
    );

    const joinCode = data?.joinCodes?.[0];
    const home = joinCode?.home;
    const homeId = home?.id;

    // Derive states from query data
    const isDenied = joinCode?.denied?.some((u) => u.id === user?.id) ?? false;

    const isMember =
        home?.owner?.id === user?.id ||
        home?.admins?.some((u) => u.id === user?.id) ||
        home?.homeMembers?.some((u) => u.id === user?.id) ||
        false;

    const hasPendingRequest =
        joinCode?.joinCodeRequests?.some((r) => r.user?.id === user?.id) ??
        false;

    // Redirect to home if member
    useEffect(() => {
        if (isMember && homeId) {
            const timer = setTimeout(() => {
                navigate({ to: "/home/$homeId", params: { homeId } });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isMember, homeId, navigate]);

    const isLoading = authLoading || codeLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                </div>
            </div>
        );
    }

    if (!user?.id) {
        return (
            <PageLayout>
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle>Sign In Required</CardTitle>
                        <CardDescription>
                            Please sign in to submit a join request.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginPage />
                    </CardContent>
                </Card>
            </PageLayout>
        );
    }

    if (!code) {
        return (
            <PageLayout>
                <ErrorCard title="Missing Code">
                    Please provide an invite code in the URL. For example:
                    /join?code=ABC123
                </ErrorCard>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <ErrorCard title="Error">
                    An error occurred while loading the invite code. Please try
                    again.
                </ErrorCard>
            </PageLayout>
        );
    }

    if (!joinCode) {
        return (
            <PageLayout>
                <ErrorCard title="Invalid Code">
                    The invite code "{code}" could not be found.
                </ErrorCard>
            </PageLayout>
        );
    }

    if (isMember) {
        return (
            <PageLayout>
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Welcome!
                        </CardTitle>
                        <CardDescription>
                            You're a member of{" "}
                            <strong>{home?.name || "this home"}</strong>.
                            Redirecting...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </PageLayout>
        );
    }

    if (isDenied) {
        return (
            <PageLayout>
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-destructive" />
                            Request Denied
                        </CardTitle>
                        <CardDescription>
                            Your request to join{" "}
                            <strong>{home?.name || "this home"}</strong> was
                            denied.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="mx-auto max-w-md space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Join Home</CardTitle>
                        <CardDescription>
                            You've been invited to join{" "}
                            <strong>{home?.name || "a home"}</strong>.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {hasPendingRequest ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Request Pending
                            </CardTitle>
                            <CardDescription>
                                Waiting for the home owner or admin to review
                                your request.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <JoinRequestForm
                        code={joinCode.code}
                        joinCodeId={joinCode.id}
                        homeId={homeId || ""}
                    />
                )}
            </div>
        </PageLayout>
    );
}

function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8">{children}</div>
        </div>
    );
}

function ErrorCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    {title}
                </CardTitle>
                <CardDescription>{children}</CardDescription>
            </CardHeader>
        </Card>
    );
}
