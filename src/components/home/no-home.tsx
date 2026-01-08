/** @format */

"use client";

import { useState } from "react";
import { Home, Users } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CreateHomeDialog } from "./create-home-dialog";
import { Button } from "@/components/ui/button";

export function NoHome() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Home className="h-8 w-8 text-primary" />
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
                                <Home className="h-5 w-5 text-primary" />
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
    );
}
