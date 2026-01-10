/** @format */

"use client";

import { useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NoteActionMenu } from "./note-action-menu";
import { db } from "@/lib/db/db";
import { id } from "@instantdb/react";
import { useAuthContext } from "@/components/auth/auth-provider";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type NoteWithRecipe = InstaQLEntity<
    AppSchema,
    "notes",
    {
        recipe: {
            home: {};
        };
    }
> & {
    created: Date | string | number;
    updated: Date | string | number;
};

interface RecipeNotesProps {
    recipeId: string;
}

export function RecipeNotes({ recipeId }: RecipeNotesProps) {
    const { user } = useAuthContext();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<NoteWithRecipe | null>(null);
    const [noteContent, setNoteContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Query notes for this recipe, ordered by created date descending (newest first)
    const query = user?.id
        ? {
              notes: {
                  $: {
                      where: {
                          "recipe.id": recipeId,
                      },
                      order: { created: "desc" as const },
                  },
                  recipe: {
                      home: {},
                  },
              },
          }
        : null;

    const { data, isLoading } = db.useQuery(query);

    const notes =
        query && data
            ? ((data as unknown as { notes?: NoteWithRecipe[] }).notes || [])
            : ([] as NoteWithRecipe[]);

    const handleCreateNote = async () => {
        if (!noteContent.trim() || !user?.id) return;

        setIsSubmitting(true);
        try {
            const now = new Date();
            const noteId = id();

            db.transact(
                db.tx.notes[noteId]
                    .create({
                        content: noteContent.trim(),
                        created: now,
                        updated: now,
                    })
                    .link({ recipe: recipeId })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setNoteContent("");
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Error creating note:", error);
            alert("Failed to create note. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditNote = (note: NoteWithRecipe) => {
        setEditingNote(note);
        setNoteContent(note.content);
        setIsEditDialogOpen(true);
    };

    const handleUpdateNote = async () => {
        if (!noteContent.trim() || !editingNote?.id) return;

        setIsSubmitting(true);
        try {
            const now = new Date();

            db.transact(
                db.tx.notes[editingNote.id].update({
                    content: noteContent.trim(),
                    updated: now,
                })
            );

            // Wait a moment for the transaction to complete
            await new Promise((resolve) => setTimeout(resolve, 100));

            setNoteContent("");
            setEditingNote(null);
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error("Error updating note:", error);
            alert("Failed to update note. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelCreate = () => {
        setNoteContent("");
        setIsCreateDialogOpen(false);
    };

    const handleCancelEdit = () => {
        setNoteContent("");
        setEditingNote(null);
        setIsEditDialogOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <StickyNote className="h-5 w-5" />
                            Notes
                        </CardTitle>
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            size="sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Note
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading notes...
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No notes yet. Add your first note to get started!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="border rounded-lg p-4 space-y-2 relative"
                                >
                                    <div className="absolute top-4 right-4">
                                        <NoteActionMenu
                                            note={note}
                                            onEdit={() => handleEditNote(note)}
                                        />
                                    </div>
                                    <div className="pr-12">
                                        <p className="text-sm whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                        {note.created && (
                                            <div>
                                                Created:{" "}
                                                {new Date(
                                                    note.created
                                                ).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                        {note.updated &&
                                            note.updated !== note.created && (
                                                <div>
                                                    Updated:{" "}
                                                    {new Date(
                                                        note.updated
                                                    ).toLocaleDateString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Note Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                            Add a note for this recipe. Notes are saved and
                            synced across devices.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Enter your note here..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={6}
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCancelCreate}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateNote}
                            disabled={isSubmitting || !noteContent.trim()}
                        >
                            {isSubmitting ? "Saving..." : "Save Note"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Note Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                            Update your note. Changes are saved and synced
                            across devices.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Enter your note here..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={6}
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateNote}
                            disabled={isSubmitting || !noteContent.trim()}
                        >
                            {isSubmitting ? "Saving..." : "Update Note"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
