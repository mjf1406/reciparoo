/** @format */

"use client";

import { GoogleOAuthButton } from "./google-oauth";
import { MagicCodeAuth } from "./magic-code-auth";
import TryAsGuestButton from "./guest-auth";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ThemeSwitch } from "@/components/themes/theme-switch";
import { Link } from "@tanstack/react-router";

export function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Simple header for login page */}
            <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-80"
                    >
                        <img
                            src="/brand/logo.webp"
                            alt="Reciparoo"
                            className="h-12 w-auto"
                        />
                        <img
                            src="/brand/text.webp"
                            alt=""
                            className="h-6 w-auto"
                        />
                    </Link>
                    <ThemeSwitch />
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src="/brand/logo.webp"
                            alt="Reciparoo"
                            className="h-24 w-auto"
                        />
                        <img
                            src="/brand/text.webp"
                            alt=""
                            className="h-8 w-auto"
                        />
                    </div>
                    <CardDescription className="text-base">
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
        </div>
    );
}
