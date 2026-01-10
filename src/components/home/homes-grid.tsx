/** @format */

"use client";

import { useNavigate } from "@tanstack/react-router";
import { Home as HomeIcon, Plus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateHomeDialog } from "./create-home-dialog";
import { HomeActionMenu } from "./home-action-menu";
import { useState } from "react";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type HomeWithRelations = InstaQLEntity<
    AppSchema,
    "homes",
    {
        owner: {};
        admins: {};
        homeMembers: {};
    }
>;

interface HomesGridProps {
    homes: HomeWithRelations[];
}

export function HomesGrid({ homes }: HomesGridProps) {
    const navigate = useNavigate();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const handleHomeClick = (homeId: string) => {
        navigate({
            to: "/home/$homeId",
            params: { homeId },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Homes</h1>
                    <p className="text-muted-foreground mt-2">
                        Select a home to manage recipes, meal plans, and more
                    </p>
                </div>
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    size="lg"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Home
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {homes.map((home) => (
                    <Card
                        key={home.id}
                        className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative"
                        onClick={() => handleHomeClick(home.id)}
                    >
                        <div
                            className="absolute top-4 right-4 z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <HomeActionMenu home={home} />
                        </div>
                        <CardHeader>
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                                <HomeIcon className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">
                                {home.name}
                            </CardTitle>
                            <CardDescription className="mt-2 line-clamp-2">
                                {home.description || "No description"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleHomeClick(home.id);
                                }}
                            >
                                Open Home
                            </Button>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-1 text-xs text-muted-foreground pt-2">
                            {home.created && (
                                <div>
                                    Created:{" "}
                                    {new Date(home.created).toLocaleTimeString(
                                        undefined,
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </div>
                            )}
                            {home.updated && (
                                <div>
                                    Updated:{" "}
                                    {new Date(home.updated).toLocaleTimeString(
                                        undefined,
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                ))}

                {/* Add New Home Card */}
                <Card
                    className="border-dashed border-2 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <CardHeader className="flex items-center justify-center min-h-[200px]">
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-xl">
                                Create New Home
                            </CardTitle>
                            <CardDescription>
                                Start a new shared workspace
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <CreateHomeDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    );
}
