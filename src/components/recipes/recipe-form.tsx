/** @format */

"use client";

import { useState, useRef } from "react";
import { Plus, X, Trash2 } from "lucide-react";
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

interface InstructionSection {
    title: string;
    steps: Array<{
        step: number;
        instruction: string;
    }>;
}

// Type guard to detect old format
function isOldFormat(data: any): data is ProcedureStep[] {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        "instruction" in data[0] &&
        !("title" in data[0])
    );
}

interface RecipeFormProps {
    onSubmit: (data: {
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
        nutritionLabelImageURL?: string;
        description?: string;
        diet?: string;
        prepTime?: number;
        cookTime?: number;
        yield?: number;
        servingSize?: number;
        servingUnit?: string;
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
    const [imageURL] = useState(initialData?.imageURL || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.imageURL || null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [nutritionLabelImageURL] = useState(initialData?.nutritionLabelImageURL || "");
    const [nutritionLabelFile, setNutritionLabelFile] = useState<File | null>(null);
    const [nutritionLabelPreview, setNutritionLabelPreview] = useState<string | null>(
        initialData?.nutritionLabelImageURL || null
    );
    const nutritionLabelFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDiets, setSelectedDiets] = useState<string[]>(
        initialData?.diet ? initialData.diet.split(",").map((d) => d.trim()) : []
    );
    const [prepTime, setPrepTime] = useState<string>(
        initialData?.prepTime?.toString() || ""
    );
    const [cookTime, setCookTime] = useState<string>(
        initialData?.cookTime?.toString() || ""
    );
    const [yieldValue, setYieldValue] = useState<string>(
        initialData?.yield?.toString() || ""
    );
    const [servingSize, setServingSize] = useState<string>(
        initialData?.servingSize?.toString() || ""
    );
    const [servingUnit, setServingUnit] = useState<string>(
        initialData?.servingUnit || ""
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
    // Initialize instruction sections - handle both old and new formats
    const initializeInstructionSections = (): InstructionSection[] => {
        if (!initialData?.procedure) {
            return [{ title: "", steps: [{ step: 1, instruction: "" }] }];
        }
        
        try {
            const parsed = JSON.parse(initialData.procedure);
            if (isOldFormat(parsed)) {
                // Convert old format to new format (single section titled "Instructions")
                return [
                    {
                        title: "Instructions",
                        steps: parsed.map((step) => ({
                            step: step.step,
                            instruction: step.instruction,
                        })),
                    },
                ];
            } else {
                // Already in new format
                return parsed as InstructionSection[];
            }
        } catch (e) {
            // If parsing fails, return default
            return [{ title: "", steps: [{ step: 1, instruction: "" }] }];
        }
    };

    const [instructionSections, setInstructionSections] = useState<InstructionSection[]>(
        initializeInstructionSections
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

    const handleNutritionLabelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setNutritionLabelFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setNutritionLabelPreview(reader.result as string);
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
            nutritionLabelFile: nutritionLabelFile || undefined,
            nutritionLabelImageURL: nutritionLabelImageURL.trim() || undefined,
            description: description.trim() || undefined,
            diet: selectedDiets.length > 0 ? selectedDiets.join(",") : undefined,
            prepTime: prepTime ? parseInt(prepTime, 10) : undefined,
            cookTime: cookTime ? parseInt(cookTime, 10) : undefined,
            yield: yieldValue ? parseInt(yieldValue, 10) : undefined,
            servingSize: servingSize ? parseInt(servingSize, 10) : undefined,
            servingUnit: servingUnit.trim() || undefined,
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

    // Section management functions
    const addSection = () => {
        setInstructionSections([
            ...instructionSections,
            { title: "", steps: [{ step: 1, instruction: "" }] },
        ]);
    };

    const removeSection = (sectionIndex: number) => {
        if (instructionSections.length > 1) {
            setInstructionSections(
                instructionSections.filter((_, i) => i !== sectionIndex)
            );
        }
    };

    const updateSectionTitle = (sectionIndex: number, title: string) => {
        const updated = [...instructionSections];
        updated[sectionIndex] = { ...updated[sectionIndex], title };
        setInstructionSections(updated);
    };

    // Step management functions
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
            // Renumber steps
            const renumbered = filteredSteps.map((step, i) => ({
                step: i + 1,
                instruction: step.instruction,
            }));
            updated[sectionIndex] = { ...section, steps: renumbered };
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

            {/* Nutrition Label Image Upload */}
            <div className="space-y-2">
                <Label htmlFor="nutritionLabelImageFile">Nutrition Label Image</Label>
                <div className="flex gap-2">
                    <Input
                        ref={nutritionLabelFileInputRef}
                        id="nutritionLabelImageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleNutritionLabelFileChange}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    {nutritionLabelFile && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setNutritionLabelFile(null);
                                setNutritionLabelPreview(initialData?.nutritionLabelImageURL || null);
                                if (nutritionLabelFileInputRef.current) {
                                    nutritionLabelFileInputRef.current.value = "";
                                }
                            }}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {nutritionLabelPreview && (
                    <div className="mt-2 w-full max-w-xs">
                        <ImageSkeleton
                            src={nutritionLabelPreview}
                            alt="Nutrition label preview"
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
                        <ComboboxChips>
                            {selectedDiets.map((diet) => (
                                <ComboboxChip key={diet}>
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

            {/* Yield and Serving Size */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="yield">Yield</Label>
                    <Input
                        id="yield"
                        type="number"
                        min="0"
                        value={yieldValue}
                        onChange={(e) => setYieldValue(e.target.value)}
                        placeholder="12"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="servingSize">Serving Size</Label>
                    <Input
                        id="servingSize"
                        type="number"
                        min="0"
                        value={servingSize}
                        onChange={(e) => setServingSize(e.target.value)}
                        placeholder="4"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Serving Unit */}
            <div className="space-y-2">
                <Label htmlFor="servingUnit">Serving Unit</Label>
                <Input
                    id="servingUnit"
                    type="text"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    placeholder="e.g., tortilla, cup, grams, slice"
                    disabled={isLoading}
                />
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

            {/* Procedure / Instructions */}
            <div className="space-y-4">
                <Label>Procedure / Instructions</Label>
                <div className="space-y-6">
                    {instructionSections.map((section, sectionIndex) => (
                        <div
                            key={sectionIndex}
                            className="border rounded-lg p-4 space-y-4 bg-muted/30"
                        >
                            {/* Section Header */}
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Section title (e.g., Mix the Dough)"
                                    value={section.title}
                                    onChange={(e) =>
                                        updateSectionTitle(
                                            sectionIndex,
                                            e.target.value
                                        )
                                    }
                                    disabled={isLoading}
                                    className="flex-1 font-semibold"
                                />
                                {instructionSections.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSection(sectionIndex)}
                                        disabled={isLoading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">
                                            Remove section
                                        </span>
                                    </Button>
                                )}
                            </div>

                            {/* Steps within section */}
                            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                                {section.steps.map((step, stepIndex) => (
                                    <div
                                        key={stepIndex}
                                        className="flex gap-2 items-start"
                                    >
                                        <div className="shrink-0 pt-2 text-sm font-medium text-muted-foreground">
                                            {step.step}.
                                        </div>
                                        <Textarea
                                            placeholder={`Step ${step.step} instruction...`}
                                            value={step.instruction}
                                            onChange={(e) =>
                                                updateStep(
                                                    sectionIndex,
                                                    stepIndex,
                                                    e.target.value
                                                )
                                            }
                                            disabled={isLoading}
                                            rows={3}
                                            className="flex-1"
                                        />
                                        {section.steps.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeStep(
                                                        sectionIndex,
                                                        stepIndex
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="mt-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Remove step
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addStep(sectionIndex)}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Step to Section
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addSection}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
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
