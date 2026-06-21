/** @format */

"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { reorderArray, renumberSteps } from "@/lib/utils/reorder";
import type { InstructionSection, ProcedureStep } from "@/lib/utils/recipe-parse";

function DragHandle({
    listeners,
    attributes,
    disabled,
    label,
}: {
    listeners: ReturnType<typeof useSortable>["listeners"];
    attributes: ReturnType<typeof useSortable>["attributes"];
    disabled?: boolean;
    label: string;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 cursor-grab touch-none active:cursor-grabbing text-muted-foreground hover:text-foreground"
            disabled={disabled}
            aria-label={label}
            {...attributes}
            {...listeners}
        >
            <GripVertical className="h-4 w-4" />
        </Button>
    );
}

interface SortableStepRowProps {
    id: string;
    step: ProcedureStep;
    stepIndex: number;
    sectionIndex: number;
    isLoading?: boolean;
    canRemove: boolean;
    textareaRows?: number;
    onUpdate: (sectionIndex: number, stepIndex: number, instruction: string) => void;
    onRemove: (sectionIndex: number, stepIndex: number) => void;
}

export function SortableStepRow({
    id,
    step,
    stepIndex,
    sectionIndex,
    isLoading = false,
    canRemove,
    textareaRows = 3,
    onUpdate,
    onRemove,
}: SortableStepRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: isLoading });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex gap-2 items-start",
                isDragging && "opacity-50 ring-2 ring-primary/20 rounded-lg shadow-lg z-10 bg-background"
            )}
        >
            <DragHandle
                listeners={listeners}
                attributes={attributes}
                disabled={isLoading}
                label="Drag to reorder step"
            />
            <div className="shrink-0 pt-2 text-sm font-medium text-muted-foreground">
                {step.step}.
            </div>
            <Textarea
                placeholder={`Step ${step.step} instruction...`}
                value={step.instruction}
                onChange={(e) => onUpdate(sectionIndex, stepIndex, e.target.value)}
                disabled={isLoading}
                rows={textareaRows}
                className="flex-1"
            />
            {canRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(sectionIndex, stepIndex)}
                    disabled={isLoading}
                    className="mt-2"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove step</span>
                </Button>
            )}
        </div>
    );
}

interface SortableStepListProps {
    sectionIndex: number;
    steps: ProcedureStep[];
    isLoading?: boolean;
    textareaRows?: number;
    onStepsChange: (sectionIndex: number, steps: ProcedureStep[]) => void;
    onUpdate: (sectionIndex: number, stepIndex: number, instruction: string) => void;
    onRemove: (sectionIndex: number, stepIndex: number) => void;
}

export function SortableStepList({
    sectionIndex,
    steps,
    isLoading = false,
    textareaRows = 3,
    onStepsChange,
    onUpdate,
    onRemove,
}: SortableStepListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const stepIds = steps.map((_, index) => `step-${sectionIndex}-${index}`);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = stepIds.indexOf(String(active.id));
        const newIndex = stepIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        onStepsChange(sectionIndex, renumberSteps(reorderArray(steps, oldIndex, newIndex)));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {steps.map((step, stepIndex) => (
                        <SortableStepRow
                            key={stepIds[stepIndex]}
                            id={stepIds[stepIndex]}
                            step={step}
                            stepIndex={stepIndex}
                            sectionIndex={sectionIndex}
                            isLoading={isLoading}
                            canRemove={steps.length > 1}
                            textareaRows={textareaRows}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

interface SortableSectionCardProps {
    id: string;
    section: InstructionSection;
    sectionIndex: number;
    isLoading?: boolean;
    canRemoveSection: boolean;
    onTitleChange: (sectionIndex: number, title: string) => void;
    onRemoveSection: (sectionIndex: number) => void;
    onStepsChange: (sectionIndex: number, steps: ProcedureStep[]) => void;
    onUpdateStep: (
        sectionIndex: number,
        stepIndex: number,
        instruction: string
    ) => void;
    onRemoveStep: (sectionIndex: number, stepIndex: number) => void;
    onAddStep: (sectionIndex: number) => void;
}

export function SortableSectionCard({
    id,
    section,
    sectionIndex,
    isLoading = false,
    canRemoveSection,
    onTitleChange,
    onRemoveSection,
    onStepsChange,
    onUpdateStep,
    onRemoveStep,
    onAddStep,
}: SortableSectionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: isLoading });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "border rounded-lg p-4 space-y-4 bg-muted/30",
                isDragging && "opacity-50 ring-2 ring-primary/20 shadow-lg z-10"
            )}
        >
            <div className="flex items-center gap-2">
                <DragHandle
                    listeners={listeners}
                    attributes={attributes}
                    disabled={isLoading}
                    label="Drag to reorder section"
                />
                <Input
                    placeholder="Section title (e.g., Mix the Dough)"
                    value={section.title}
                    onChange={(e) => onTitleChange(sectionIndex, e.target.value)}
                    disabled={isLoading}
                    className="flex-1 font-semibold"
                />
                {canRemoveSection && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveSection(sectionIndex)}
                        disabled={isLoading}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove section</span>
                    </Button>
                )}
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                <SortableStepList
                    sectionIndex={sectionIndex}
                    steps={section.steps}
                    isLoading={isLoading}
                    onStepsChange={onStepsChange}
                    onUpdate={onUpdateStep}
                    onRemove={onRemoveStep}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddStep(sectionIndex)}
                    disabled={isLoading}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Step to Section
                </Button>
            </div>
        </div>
    );
}

interface SortableSectionListProps {
    sections: InstructionSection[];
    isLoading?: boolean;
    onSectionsChange: (sections: InstructionSection[]) => void;
    onTitleChange: (sectionIndex: number, title: string) => void;
    onRemoveSection: (sectionIndex: number) => void;
    onStepsChange: (sectionIndex: number, steps: ProcedureStep[]) => void;
    onUpdateStep: (
        sectionIndex: number,
        stepIndex: number,
        instruction: string
    ) => void;
    onRemoveStep: (sectionIndex: number, stepIndex: number) => void;
    onAddStep: (sectionIndex: number) => void;
}

export function SortableSectionList({
    sections,
    isLoading = false,
    onSectionsChange,
    onTitleChange,
    onRemoveSection,
    onStepsChange,
    onUpdateStep,
    onRemoveStep,
    onAddStep,
}: SortableSectionListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const sectionIds = sections.map((_, index) => `section-${index}`);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sectionIds.indexOf(String(active.id));
        const newIndex = sectionIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        onSectionsChange(reorderArray(sections, oldIndex, newIndex));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={sectionIds}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <SortableSectionCard
                            key={sectionIds[sectionIndex]}
                            id={sectionIds[sectionIndex]}
                            section={section}
                            sectionIndex={sectionIndex}
                            isLoading={isLoading}
                            canRemoveSection={sections.length > 1}
                            onTitleChange={onTitleChange}
                            onRemoveSection={onRemoveSection}
                            onStepsChange={onStepsChange}
                            onUpdateStep={onUpdateStep}
                            onRemoveStep={onRemoveStep}
                            onAddStep={onAddStep}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
