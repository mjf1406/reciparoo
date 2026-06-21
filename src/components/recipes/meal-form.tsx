/** @format */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import {
    Combobox,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxChips,
    ComboboxChip,
    ComboboxChipsInput,
    ComboboxEmpty,
    useComboboxAnchor,
} from "@/components/ui/combobox";
import useAllRecipes from "@/hooks/use-all-recipes";
import type { MealComponent } from "@/lib/utils/recipe-meal";
import { parseMealComponents } from "@/lib/utils/recipe-meal";
import { SortableStepList } from "@/components/recipes/sortable-instruction-rows";
import type { ProcedureStep } from "@/lib/utils/recipe-parse";

const DIET_OPTIONS = [
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "nut-free",
    "keto",
    "paleo",
    "pescatarian",
    "halal",
    "kosher",
];

interface Ingredient {
    quantity: string;
    unit: string;
    name: string;
}

interface InstructionSection {
    title: string;
    steps: Array<{
        step: number;
        instruction: string;
    }>;
}

export interface MealFormSubmitData {
    name: string;
    imageFile?: File;
    imageURL?: string;
    nutritionLabelFile?: File;
    nutritionLabelImageURL?: string;
    description?: string;
    diet?: string;
    prepTime?: number;
    cookTime?: number;
    yield?: number;
    servingSize?: number;
    servingUnit?: string;
    components: string;
    ingredients: string;
    equipment: string;
    procedure: string;
    source?: string;
    videoURL?: string;
}

interface MealFormProps {
    onSubmit: (data: MealFormSubmitData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    preselectedRecipeIds?: string[];
    initialData?: {
        name?: string;
        imageURL?: string;
        nutritionLabelImageURL?: string;
        description?: string;
        diet?: string;
        prepTime?: number;
        cookTime?: number;
        yield?: number;
        servingSize?: number;
        servingUnit?: string;
        components?: string;
        ingredients?: string;
        equipment?: string;
        procedure?: string;
        source?: string;
        videoURL?: string;
    };
}

export function MealForm({
    onSubmit,
    onCancel,
    isLoading = false,
    preselectedRecipeIds = [],
    initialData,
}: MealFormProps) {
    const { recipes: allRecipes, isLoading: recipesLoading } = useAllRecipes();

    const [name, setName] = useState(initialData?.name || "");
    const [imageURL] = useState(initialData?.imageURL || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.imageURL || null
    );
    const [nutritionLabelImageURL] = useState(
        initialData?.nutritionLabelImageURL || ""
    );
    const [selectedDiets, setSelectedDiets] = useState<string[]>(
        initialData?.diet ? initialData.diet.split(",").map((d) => d.trim()) : []
    );
    const [prepTime, setPrepTime] = useState(
        initialData?.prepTime?.toString() || ""
    );
    const [cookTime, setCookTime] = useState(
        initialData?.cookTime?.toString() || ""
    );
    const [yieldValue, setYieldValue] = useState(
        initialData?.yield?.toString() || ""
    );
    const [servingSize, setServingSize] = useState(
        initialData?.servingSize?.toString() || ""
    );
    const [servingUnit, setServingUnit] = useState(
        initialData?.servingUnit || ""
    );
    const [components, setComponents] = useState<MealComponent[]>(() => {
        if (initialData?.components) {
            return parseMealComponents(initialData.components);
        }
        return preselectedRecipeIds.map((id) => ({
            recipeId: id,
            multiplier: 1,
        }));
    });
    const [recipeSearch, setRecipeSearch] = useState("");
    const [ingredients, setIngredients] = useState<Ingredient[]>(
        initialData?.ingredients
            ? (JSON.parse(initialData.ingredients) as Ingredient[])
            : [{ quantity: "", unit: "", name: "" }]
    );
    const [equipment, setEquipment] = useState<string[]>(
        initialData?.equipment
            ? (JSON.parse(initialData.equipment) as string[])
            : [""]
    );
    const [instructionSections, setInstructionSections] = useState<
        InstructionSection[]
    >(() => {
        if (!initialData?.procedure) {
            return [{ title: "Custom Steps", steps: [{ step: 1, instruction: "" }] }];
        }
        try {
            const parsed = JSON.parse(initialData.procedure);
            if (Array.isArray(parsed) && parsed.length > 0 && "instruction" in parsed[0]) {
                return [
                    {
                        title: "Custom Steps",
                        steps: parsed.map((step: { step: number; instruction: string }) => ({
                            step: step.step,
                            instruction: step.instruction,
                        })),
                    },
                ];
            }
            return parsed as InstructionSection[];
        } catch {
            return [{ title: "Custom Steps", steps: [{ step: 1, instruction: "" }] }];
        }
    });
    const [source, setSource] = useState(initialData?.source || "");
    const [videoURL, setVideoURL] = useState(initialData?.videoURL || "");

    const dietAnchor = useComboboxAnchor();
    const [dietOpen, setDietOpen] = useState(false);
    const [dietSearch, setDietSearch] = useState("");

    useEffect(() => {
        if (!initialData?.components && preselectedRecipeIds.length > 0) {
            setComponents((prev) => {
                const existing = new Set(prev.map((c) => c.recipeId));
                const additions = preselectedRecipeIds
                    .filter((id) => !existing.has(id))
                    .map((id) => ({ recipeId: id, multiplier: 1 }));
                return additions.length > 0 ? [...prev, ...additions] : prev;
            });
        }
    }, [preselectedRecipeIds, initialData?.components]);

    const recipeMap = useMemo(
        () => new Map(allRecipes.map((r) => [r.id, r])),
        [allRecipes]
    );

    const availableRecipes = useMemo(() => {
        const selected = new Set(components.map((c) => c.recipeId));
        const query = recipeSearch.trim().toLowerCase();
        return allRecipes
            .filter((r) => !r.isMeal && !selected.has(r.id))
            .filter((r) =>
                query ? r.name.toLowerCase().includes(query) : true
            )
            .slice(0, 8);
    }, [allRecipes, components, recipeSearch]);

    const filteredDietOptions = DIET_OPTIONS.filter(
        (option) =>
            option.toLowerCase().includes(dietSearch.toLowerCase()) &&
            !selectedDiets.includes(option)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const ingredientsData = ingredients
            .filter((ing) => ing.name.trim())
            .map((ing) => ({
                quantity: ing.quantity.trim(),
                unit: ing.unit.trim(),
                name: ing.name.trim(),
            }));

        const equipmentData = equipment.filter((eq) => eq.trim());

        onSubmit({
            name: name.trim(),
            imageFile: imageFile || undefined,
            imageURL: imageURL.trim() || undefined,
            nutritionLabelFile: undefined,
            nutritionLabelImageURL: nutritionLabelImageURL.trim() || undefined,
            description: description.trim() || undefined,
            diet: selectedDiets.length > 0 ? selectedDiets.join(",") : undefined,
            prepTime: prepTime ? parseInt(prepTime, 10) : undefined,
            cookTime: cookTime ? parseInt(cookTime, 10) : undefined,
            yield: yieldValue ? parseInt(yieldValue, 10) : undefined,
            servingSize: servingSize ? parseInt(servingSize, 10) : undefined,
            servingUnit: servingUnit.trim() || undefined,
            components: JSON.stringify(components),
            ingredients: JSON.stringify(ingredientsData),
            equipment: JSON.stringify(equipmentData),
            procedure: JSON.stringify(
                instructionSections
                    .map((section) => ({
                        title: section.title.trim(),
                        steps: section.steps
                            .filter((step) => step.instruction.trim())
                            .map((step, index) => ({
                                step: index + 1,
                                instruction: step.instruction.trim(),
                            })),
                    }))
                    .filter((section) => section.steps.length > 0)
            ),
            source: source.trim() || undefined,
            videoURL: videoURL.trim() || undefined,
        });
    };

    const addComponent = (recipeId: string) => {
        if (components.some((c) => c.recipeId === recipeId)) return;
        setComponents([...components, { recipeId, multiplier: 1 }]);
        setRecipeSearch("");
    };

    const removeComponent = (recipeId: string) => {
        setComponents(components.filter((c) => c.recipeId !== recipeId));
    };

    const updateMultiplier = (recipeId: string, multiplier: number) => {
        setComponents(
            components.map((c) =>
                c.recipeId === recipeId ? { ...c, multiplier } : c
            )
        );
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { quantity: "", unit: "", name: "" }]);
    };

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        }
    };

    const updateIngredient = (
        index: number,
        field: keyof Ingredient,
        value: string
    ) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const addEquipment = () => setEquipment([...equipment, ""]);

    const removeEquipment = (index: number) => {
        if (equipment.length > 1) {
            setEquipment(equipment.filter((_, i) => i !== index));
        }
    };

    const updateEquipment = (index: number, value: string) => {
        const updated = [...equipment];
        updated[index] = value;
        setEquipment(updated);
    };

    const addStep = (sectionIndex: number) => {
        const updated = [...instructionSections];
        const section = updated[sectionIndex];
        updated[sectionIndex] = {
            ...section,
            steps: [
                ...section.steps,
                { step: section.steps.length + 1, instruction: "" },
            ],
        };
        setInstructionSections(updated);
    };

    const removeStep = (sectionIndex: number, stepIndex: number) => {
        const updated = [...instructionSections];
        const section = updated[sectionIndex];
        if (section.steps.length > 1) {
            const filteredSteps = section.steps.filter((_, i) => i !== stepIndex);
            updated[sectionIndex] = {
                ...section,
                steps: filteredSteps.map((step, i) => ({
                    step: i + 1,
                    instruction: step.instruction,
                })),
            };
            setInstructionSections(updated);
        }
    };

    const updateStep = (
        sectionIndex: number,
        stepIndex: number,
        instruction: string
    ) => {
        const updated = [...instructionSections];
        updated[sectionIndex].steps[stepIndex] = {
            ...updated[sectionIndex].steps[stepIndex],
            instruction,
        };
        setInstructionSections(updated);
    };

    const handleStepsChange = (sectionIndex: number, steps: ProcedureStep[]) => {
        const updated = [...instructionSections];
        updated[sectionIndex] = { ...updated[sectionIndex], steps };
        setInstructionSections(updated);
    };

    const customStepsSectionIndex = 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="meal-name">
                    Meal Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="meal-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sunday Dinner"
                    required
                    disabled={isLoading}
                    autoFocus
                />
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <Label>Component Recipes</Label>
                <p className="text-sm text-muted-foreground">
                    Select one or more recipes to combine. Each recipe stays live
                    — changes to source recipes update this meal automatically.
                </p>

                {components.length > 0 && (
                    <div className="space-y-2">
                        {components.map((component) => {
                            const recipe = recipeMap.get(component.recipeId);
                            return (
                                <div
                                    key={component.recipeId}
                                    className="flex items-center gap-2 rounded-md border bg-background p-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {recipe?.name || "Unknown recipe"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Label
                                            htmlFor={`mult-${component.recipeId}`}
                                            className="text-xs whitespace-nowrap"
                                        >
                                            Multiplier
                                        </Label>
                                        <Input
                                            id={`mult-${component.recipeId}`}
                                            type="number"
                                            min="0.25"
                                            max="10"
                                            step="0.25"
                                            value={component.multiplier}
                                            onChange={(e) => {
                                                const value = parseFloat(
                                                    e.target.value
                                                );
                                                if (!isNaN(value) && value > 0) {
                                                    updateMultiplier(
                                                        component.recipeId,
                                                        value
                                                    );
                                                }
                                            }}
                                            className="w-20"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                removeComponent(component.recipeId)
                                            }
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={recipeSearch}
                        onChange={(e) => setRecipeSearch(e.target.value)}
                        placeholder="Search recipes to add..."
                        className="pl-9"
                        disabled={isLoading || recipesLoading}
                    />
                </div>

                {availableRecipes.length > 0 && recipeSearch.trim() && (
                    <div className="rounded-md border bg-background divide-y max-h-48 overflow-y-auto">
                        {availableRecipes.map((recipe) => (
                            <button
                                key={recipe.id}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors"
                                onClick={() => addComponent(recipe.id)}
                                disabled={isLoading}
                            >
                                {recipe.name}
                            </button>
                        ))}
                    </div>
                )}

                {components.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                        No recipes selected yet. Search above to add components,
                        or add custom ingredients and steps below.
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="meal-image">Meal Image</Label>
                <div className="flex gap-2">
                    <Input
                        id="meal-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                        }}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    {imageFile && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setImageFile(null);
                                setImagePreview(initialData?.imageURL || null);
                            }}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {imagePreview && (
                    <div className="mt-2 w-full max-w-xs">
                        <ImageSkeleton
                            src={imagePreview}
                            alt="Meal preview"
                            className="rounded-lg"
                            aspectRatio="16/9"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="meal-description">Description</Label>
                <Textarea
                    id="meal-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this meal..."
                    rows={3}
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label>Diet Types</Label>
                <div ref={dietAnchor}>
                    <Combobox
                        open={dietOpen}
                        onOpenChange={setDietOpen}
                        value={selectedDiets}
                        onValueChange={(values) => setSelectedDiets(values)}
                        multiple
                    >
                        <ComboboxChips>
                            {selectedDiets.map((diet) => (
                                <ComboboxChip key={diet}>{diet}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput
                                placeholder="Select diet types..."
                                value={dietSearch}
                                onChange={(e) => setDietSearch(e.target.value)}
                                onFocus={() => setDietOpen(true)}
                            />
                        </ComboboxChips>
                        <ComboboxContent anchor={dietAnchor}>
                            <ComboboxList>
                                {filteredDietOptions.length === 0 ? (
                                    <ComboboxEmpty>No more options</ComboboxEmpty>
                                ) : (
                                    filteredDietOptions.map((option) => (
                                        <ComboboxItem key={option} value={option}>
                                            {option}
                                        </ComboboxItem>
                                    ))
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="meal-prep">Prep Time (minutes)</Label>
                    <Input
                        id="meal-prep"
                        type="number"
                        min="0"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="meal-cook">Cook Time (minutes)</Label>
                    <Input
                        id="meal-cook"
                        type="number"
                        min="0"
                        value={cookTime}
                        onChange={(e) => setCookTime(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="meal-yield">Yield</Label>
                    <Input
                        id="meal-yield"
                        type="number"
                        min="0"
                        value={yieldValue}
                        onChange={(e) => setYieldValue(e.target.value)}
                        placeholder="Leave blank to sum components"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="meal-serving">Serving Size</Label>
                    <Input
                        id="meal-serving"
                        type="number"
                        min="0"
                        value={servingSize}
                        onChange={(e) => setServingSize(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="meal-serving-unit">Serving Unit</Label>
                <Input
                    id="meal-serving-unit"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    placeholder="e.g., plate, serving"
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label>Custom Ingredients</Label>
                <p className="text-sm text-muted-foreground">
                    Optional extras added on top of combined component recipes.
                </p>
                <div className="space-y-3">
                    {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Qty"
                                value={ingredient.quantity}
                                onChange={(e) =>
                                    updateIngredient(index, "quantity", e.target.value)
                                }
                                disabled={isLoading}
                                className="w-24"
                            />
                            <Input
                                placeholder="Unit"
                                value={ingredient.unit}
                                onChange={(e) =>
                                    updateIngredient(index, "unit", e.target.value)
                                }
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Input
                                placeholder="Ingredient name"
                                value={ingredient.name}
                                onChange={(e) =>
                                    updateIngredient(index, "name", e.target.value)
                                }
                                disabled={isLoading}
                                className="flex-2"
                            />
                            {ingredients.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeIngredient(index)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addIngredient}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Ingredient
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Custom Equipment</Label>
                <div className="space-y-3">
                    {equipment.map((eq, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder="Equipment name"
                                value={eq}
                                onChange={(e) => updateEquipment(index, e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            {equipment.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEquipment(index)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addEquipment}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Custom Equipment
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Custom Steps</Label>
                <p className="text-sm text-muted-foreground">
                    Optional steps appended after all component recipe instructions.
                </p>
                {instructionSections.map((section, sectionIndex) => (
                        <div
                            key={sectionIndex}
                            className="border rounded-lg p-4 space-y-4 bg-muted/30"
                        >
                            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                                <SortableStepList
                                    sectionIndex={sectionIndex}
                                    steps={section.steps}
                                    isLoading={isLoading}
                                    textareaRows={2}
                                    onStepsChange={handleStepsChange}
                                    onUpdate={updateStep}
                                    onRemove={removeStep}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addStep(customStepsSectionIndex)}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Step
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="space-y-2">
                <Label htmlFor="meal-source">Source URL</Label>
                <Input
                    id="meal-source"
                    type="url"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="meal-video">Video Link</Label>
                <Input
                    id="meal-video"
                    type="url"
                    value={videoURL}
                    onChange={(e) => setVideoURL(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !name.trim()}>
                    {isLoading ? "Saving..." : "Save Meal"}
                </Button>
            </div>
        </form>
    );
}
