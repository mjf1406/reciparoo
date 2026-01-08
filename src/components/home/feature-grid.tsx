/** @format */

"use client";

import { BookOpen, Calendar, ShoppingCart, Refrigerator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeatureGridProps {
    homeId: string;
}

export function FeatureGrid({ homeId: _homeId }: FeatureGridProps) {
    // homeId will be used for navigation when recipes page is implemented
    void _homeId;

    const features = [
        {
            id: "recipes",
            title: "Recipes",
            description: "Create, organize, and scale your favorite recipes",
            icon: BookOpen,
            comingSoon: false,
            onClick: () => {
                // Navigate to recipes page when implemented
                console.log("Navigate to recipes");
            },
        },
        {
            id: "calendar",
            title: "Calendar",
            description: "Plan your meals and schedule recipes for specific days",
            icon: Calendar,
            comingSoon: true,
        },
        {
            id: "grocery-list",
            title: "Grocery List",
            description: "Auto-generate shopping lists from your meal plans",
            icon: ShoppingCart,
            comingSoon: true,
        },
        {
            id: "pantry",
            title: "Pantry/Fridge",
            description: "Track inventory and get notified when items run low",
            icon: Refrigerator,
            comingSoon: true,
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
                const Icon = feature.icon;
                return (
                    <Card
                        key={feature.id}
                        className={`relative transition-all hover:shadow-md ${
                            feature.comingSoon ? "opacity-75" : "cursor-pointer"
                        }`}
                        onClick={feature.comingSoon ? undefined : feature.onClick}
                    >
                        {feature.comingSoon && (
                            <div className="absolute right-4 top-4">
                                <Badge variant="secondary">Coming Soon</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                        {!feature.comingSoon && (
                            <CardContent>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        feature.onClick?.();
                                    }}
                                >
                                    Open {feature.title}
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
