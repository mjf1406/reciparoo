/** @format */

"use client";

import { GoogleOAuthButton } from "./google-oauth";
import { MagicCodeAuth } from "./magic-code-auth";
import TryAsGuestButton from "./guest-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold">Recipe Manager</CardTitle>
                    <CardDescription>
                        Organize your recipes, plan meals, and manage your pantry
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <GoogleOAuthButton />
                    <MagicCodeAuth />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>
                    <TryAsGuestButton />
                </CardContent>
            </Card>
        </div>
    );
}
