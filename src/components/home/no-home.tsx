/** @format */

"use client";

import { useState } from "react";
import { Users, Home as HomeIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CreateHomeDialog } from "./create-home-dialog";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

export function NoHome() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <div className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex items-center justify-center">
                        <img
                            src="/logo.webp"
                            alt="Reciparoo"
                            className="h-20 w-auto"
                        />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        Create Your First Home
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                        A Home is your shared workspace for managing recipes,
                        meal planning, and pantry organization
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 text-start">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Collaborate with Others
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Invite family members or roommates to your
                                    Home. Everyone can contribute recipes, plan
                                    meals together, and manage shared pantry
                                    items.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <HomeIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Organize Everything
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Keep all your recipes, meal plans, grocery
                                    lists, and pantry inventory in one place.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            Create Your First Home
                        </Button>
                    </div>
                </CardContent>
                </Card>
                <CreateHomeDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                />
            </div>
        </div>
    );
}
