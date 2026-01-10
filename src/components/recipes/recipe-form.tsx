/** @format */

"use client";

import { useState, useRef } from "react";
import { Plus, X, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxChips,
    ComboboxChip,
    ComboboxChipsInput,
    ComboboxEmpty,
    useComboboxAnchor,
} from "@/components/ui/combobox";

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

interface ProcedureStep {
    step: number;
    instruction: string;
}

interface RecipeFormProps {
    onSubmit: (data: {
        name: string;
        imageFile?: File;
        imageURL?: string;
        description?: string;
        diet?: string;
        prepTime?: number;
        cookTime?: number;
        ingredients: string;
        equipment: string;
        procedure: string;
        source?: string;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: {
        name?: string;
        imageURL?: string;
        description?: string;
        diet?: string;
        prepTime?: number;
        cookTime?: number;
        ingredients?: string;
        equipment?: string;
        procedure?: string;
        source?: string;
    };
}

export function RecipeForm({
    onSubmit,
    onCancel,
    isLoading = false,
    initialData,
}: RecipeFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [imageURL, setImageURL] = useState(initialData?.imageURL || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.imageURL || null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDiets, setSelectedDiets] = useState<string[]>(
        initialData?.diet ? initialData.diet.split(",").map((d) => d.trim()) : []
    );
    const [prepTime, setPrepTime] = useState<string>(
        initialData?.prepTime?.toString() || ""
    );
    const [cookTime, setCookTime] = useState<string>(
        initialData?.cookTime?.toString() || ""
    );
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
    const [procedureSteps, setProcedureSteps] = useState<ProcedureStep[]>(
        initialData?.procedure
            ? (JSON.parse(initialData.procedure) as ProcedureStep[])
            : [{ step: 1, instruction: "" }]
    );
    const [source, setSource] = useState(initialData?.source || "");

    const dietAnchor = useComboboxAnchor();
    const [dietOpen, setDietOpen] = useState(false);
    const [dietSearch, setDietSearch] = useState("");

    const filteredDietOptions = DIET_OPTIONS.filter((option) =>
        option.toLowerCase().includes(dietSearch.toLowerCase()) &&
        !selectedDiets.includes(option)
    );

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const ingredientsData = ingredients
            .filter((ing) => ing.quantity.trim() && ing.name.trim())
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
            description: description.trim() || undefined,
            diet: selectedDiets.length > 0 ? selectedDiets.join(",") : undefined,
            prepTime: prepTime ? parseInt(prepTime, 10) : undefined,
            cookTime: cookTime ? parseInt(cookTime, 10) : undefined,
            ingredients: JSON.stringify(ingredientsData),
            equipment: JSON.stringify(equipmentData),
            procedure: JSON.stringify(
                procedureSteps
                    .filter((step) => step.instruction.trim())
                    .map((step, index) => ({
                        step: index + 1,
                        instruction: step.instruction.trim(),
                    }))
            ),
            source: source.trim() || undefined,
        });
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { quantity: "", unit: "", name: "" }]);
    };

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        }
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const addEquipment = () => {
        setEquipment([...equipment, ""]);
    };

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

    const addProcedureStep = () => {
        setProcedureSteps([
            ...procedureSteps,
            { step: procedureSteps.length + 1, instruction: "" },
        ]);
    };

    const removeProcedureStep = (index: number) => {
        if (procedureSteps.length > 1) {
            const updated = procedureSteps.filter((_, i) => i !== index);
            // Renumber steps
            const renumbered = updated.map((step, i) => ({
                step: i + 1,
                instruction: step.instruction,
            }));
            setProcedureSteps(renumbered);
        }
    };

    const updateProcedureStep = (index: number, instruction: string) => {
        const updated = [...procedureSteps];
        updated[index] = { ...updated[index], instruction };
        setProcedureSteps(updated);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name (Required) */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Recipe Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Chocolate Chip Cookies"
                    required
                    disabled={isLoading}
                    autoFocus
                />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <Label htmlFor="imageFile">Recipe Image</Label>
                <div className="flex gap-2">
                    <Input
                        ref={fileInputRef}
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
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
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
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
                            alt="Recipe preview"
                            className="rounded-lg"
                            aspectRatio="16/9"
                        />
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of the recipe..."
                    rows={3}
                    disabled={isLoading}
                />
            </div>

            {/* Diet Multi-Select */}
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
                        <ComboboxChips anchor={dietAnchor}>
                            {selectedDiets.map((diet) => (
                                <ComboboxChip key={diet} value={diet}>
                                    {diet}
                                </ComboboxChip>
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

            {/* Prep Time and Cook Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <Input
                        id="prepTime"
                        type="number"
                        min="0"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        placeholder="15"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                    <Input
                        id="cookTime"
                        type="number"
                        min="0"
                        value={cookTime}
                        onChange={(e) => setCookTime(e.target.value)}
                        placeholder="30"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
                <Label>Ingredients</Label>
                <div className="space-y-3">
                    {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Quantity"
                                value={ingredient.quantity}
                                onChange={(e) =>
                                    updateIngredient(index, "quantity", e.target.value)
                                }
                                disabled={isLoading}
                                className="w-24"
                            />
                            <Input
                                placeholder="Unit (e.g., cups, tbsp)"
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
                                    <span className="sr-only">Remove ingredient</span>
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
                        Add Ingredient
                    </Button>
                </div>
            </div>

            {/* Equipment */}
            <div className="space-y-2">
                <Label>Equipment</Label>
                <div className="space-y-3">
                    {equipment.map((eq, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder="Equipment name (e.g., oven, mixing bowl)"
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
                                    <span className="sr-only">Remove equipment</span>
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
                        Add Equipment
                    </Button>
                </div>
            </div>

            {/* Procedure */}
            <div className="space-y-2">
                <Label>Procedure / Instructions</Label>
                <div className="space-y-3">
                    {procedureSteps.map((step, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="shrink-0 pt-2 text-sm font-medium text-muted-foreground">
                                {step.step}.
                            </div>
                            <Textarea
                                placeholder={`Step ${step.step} instruction...`}
                                value={step.instruction}
                                onChange={(e) =>
                                    updateProcedureStep(index, e.target.value)
                                }
                                disabled={isLoading}
                                rows={3}
                                className="flex-1"
                            />
                            {procedureSteps.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeProcedureStep(index)}
                                    disabled={isLoading}
                                    className="mt-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove step</span>
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addProcedureStep}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Step
                    </Button>
                </div>
            </div>

            {/* Source URL */}
            <div className="space-y-2">
                <Label htmlFor="source">Source URL</Label>
                <Input
                    id="source"
                    type="url"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="https://example.com/recipe"
                    disabled={isLoading}
                />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                >
                    {isLoading ? "Saving..." : "Save Recipe"}
                </Button>
            </div>
        </form>
    );
}
