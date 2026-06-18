/** @format */

"use client";

import { GoogleOAuthButton } from "./google-oauth";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ThemeSwitch } from "@/components/themes/theme-switch";
import { Link } from "@tanstack/react-router";

export function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
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
                            Sign in to manage your recipes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <GoogleOAuthButton />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
