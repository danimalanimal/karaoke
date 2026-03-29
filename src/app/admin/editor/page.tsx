"use client";

import { useState, useEffect, useCallback } from "react";
import type { Story, StoryNode, Choice } from "@/lib/types";

// ─── Helpers ────────────────────────────────────────────

function emptyNode(): StoryNode {
  return { text: "", choices: [] };
}

function emptyChoice(): Choice {
  return { label: "", next: "" };
}

// ─── API ────────────────────────────────────────────────

async function fetchStory(): Promise<Story> {
  const res = await fetch("/api/story");
  return res.json();
}

async function saveStory(story: Story): Promise<boolean> {
  const res = await fetch("/api/story", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(story),
  });
  return res.ok;
}

// ─── Node Editor ────────────────────────────────────────

function NodeEditor({
  nodeId,
  node,
  allNodeIds,
  onUpdate,
  onDelete,
  onRename,
}: {
  nodeId: string;
  node: StoryNode;
  allNodeIds: string[];
  onUpdate: (id: string, node: StoryNode) => void;
  onDelete: (id: string) => void;
  onRename: (oldId: string, newId: string) => void;
}) {
  const [editingId, setEditingId] = useState(false);
  const [newId, setNewId] = useState(nodeId);
  const [expanded, setExpanded] = useState(false);

  function updateText(text: string) {
    onUpdate(nodeId, { ...node, text });
  }

  function toggleComingSoon() {
    if (node.isComingSoon) {
      const { isComingSoon, comingSoonMessage, ...rest } = node;
      void isComingSoon;
      void comingSoonMessage;
      onUpdate(nodeId, rest as StoryNode);
    } else {
      onUpdate(nodeId, {
        ...node,
        isComingSoon: true,
        comingSoonMessage: "To be continued...",
        choices: [],
      });
    }
  }

  function updateComingSoonMessage(msg: string) {
    onUpdate(nodeId, { ...node, comingSoonMessage: msg });
  }

  function addChoice() {
    onUpdate(nodeId, {
      ...node,
      choices: [...node.choices, emptyChoice()],
    });
  }

  function updateChoice(idx: number, patch: Partial<Choice>) {
    const choices = node.choices.map((c, i) =>
      i === idx ? { ...c, ...patch } : c
    );
    onUpdate(nodeId, { ...node, choices });
  }

  function removeChoice(idx: number) {
    onUpdate(nodeId, {
      ...node,
      choices: node.choices.filter((_, i) => i !== idx),
    });
  }

  function commitRename() {
    const trimmed = newId.trim().toLowerCase().replace(/\s+/g, "_");
    if (trimmed && trimmed !== nodeId && !allNodeIds.includes(trimmed)) {
      onRename(nodeId, trimmed);
    }
    setNewId(trimmed || nodeId);
    setEditingId(false);
  }

  const choiceTargetWarning = (next: string) =>
    next && !allNodeIds.includes(next) ? "text-amber-400" : "text-stone-100";

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-stone-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-stone-500 text-xs">{expanded ? "▼" : "▶"}</span>
          {editingId ? (
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setNewId(nodeId);
                  setEditingId(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded bg-stone-800 border border-stone-600 px-2 py-0.5 text-sm font-mono"
              autoFocus
            />
          ) : (
            <code
              className="text-sm font-bold cursor-pointer hover:text-amber-400"
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(true);
              }}
              title="Click to rename"
            >
              {nodeId}
            </code>
          )}
          {node.isComingSoon && (
            <span className="rounded-full bg-amber-900/40 border border-amber-700 px-2 py-0.5 text-xs text-amber-400">
              coming soon
            </span>
          )}
        </div>
        <span className="text-xs text-stone-500">
          {node.choices.length} choice{node.choices.length !== 1 && "s"}
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-stone-800 p-4 space-y-4">
          {/* Text */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">
              Story text
            </label>
            <textarea
              value={node.text}
              onChange={(e) => updateText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm resize-y focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Coming soon toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={!!node.isComingSoon}
              onChange={toggleComingSoon}
              className="accent-amber-500"
            />
            <span className="text-stone-300">Dead end (coming soon)</span>
          </label>

          {node.isComingSoon && (
            <div>
              <label className="block text-xs text-stone-400 mb-1">
                Coming soon message
              </label>
              <input
                value={node.comingSoonMessage ?? ""}
                onChange={(e) => updateComingSoonMessage(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Choices */}
          {!node.isComingSoon && (
            <div>
              <label className="block text-xs text-stone-400 mb-2">
                Choices
              </label>
              <div className="space-y-2">
                {node.choices.map((choice, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <input
                      value={choice.label}
                      onChange={(e) =>
                        updateChoice(idx, { label: e.target.value })
                      }
                      placeholder="Button label"
                      className="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <div className="relative flex-1">
                      <input
                        value={choice.next}
                        onChange={(e) =>
                          updateChoice(idx, { next: e.target.value })
                        }
                        placeholder="Target node ID"
                        list={`targets-${nodeId}-${idx}`}
                        className={`w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none ${choiceTargetWarning(choice.next)}`}
                      />
                      <datalist id={`targets-${nodeId}-${idx}`}>
                        {allNodeIds.map((id) => (
                          <option key={id} value={id} />
                        ))}
                      </datalist>
                      {choice.next && !allNodeIds.includes(choice.next) && (
                        <span className="absolute right-3 top-2.5 text-xs text-amber-500" title="This node doesn't exist yet">
                          new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeChoice(idx)}
                      className="rounded-lg border border-stone-700 bg-stone-800 px-2 py-2 text-sm text-red-400 hover:bg-red-900/30 transition"
                      title="Remove choice"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addChoice}
                className="mt-2 rounded-lg border border-dashed border-stone-700 px-3 py-1.5 text-sm text-stone-400 hover:border-stone-500 hover:text-stone-200 transition"
              >
                + Add choice
              </button>
            </div>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-stone-800 flex justify-end">
            <button
              onClick={() => {
                if (confirm(`Delete node "${nodeId}"?`)) onDelete(nodeId);
              }}
              className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/60 transition"
            >
              Delete node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────

export default function EditorPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newNodeId, setNewNodeId] = useState("");

  useEffect(() => {
    fetchStory().then(setStory);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  if (!story) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading editor...</p>
      </main>
    );
  }

  const nodeIds = Object.keys(story);

  function update(id: string, node: StoryNode) {
    setStory((prev) => (prev ? { ...prev, [id]: node } : prev));
    setDirty(true);
  }

  function deleteNode(id: string) {
    setStory((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setDirty(true);
  }

  function renameNode(oldId: string, newId: string) {
    setStory((prev) => {
      if (!prev) return prev;
      const next: Story = {};
      // Preserve order, swap the key
      for (const [key, val] of Object.entries(prev)) {
        if (key === oldId) {
          next[newId] = val;
        } else {
          next[key] = val;
        }
      }
      // Update any choices that pointed to oldId
      for (const node of Object.values(next)) {
        for (const choice of node.choices) {
          if (choice.next === oldId) choice.next = newId;
        }
      }
      return next;
    });
    setDirty(true);
  }

  function addNode() {
    const id = newNodeId.trim().toLowerCase().replace(/\s+/g, "_");
    if (!id) return;
    if (nodeIds.includes(id)) {
      showToast(`Node "${id}" already exists`);
      return;
    }
    setStory((prev) => (prev ? { ...prev, [id]: emptyNode() } : prev));
    setNewNodeId("");
    setDirty(true);
  }

  function addComingSoonNode() {
    const id = newNodeId.trim().toLowerCase().replace(/\s+/g, "_");
    if (!id) return;
    if (nodeIds.includes(id)) {
      showToast(`Node "${id}" already exists`);
      return;
    }
    setStory((prev) =>
      prev
        ? {
            ...prev,
            [id]: {
              text: "",
              choices: [],
              isComingSoon: true,
              comingSoonMessage: "To be continued...",
            },
          }
        : prev
    );
    setNewNodeId("");
    setDirty(true);
  }

  async function handleSave() {
    if (!story) return;
    setSaving(true);
    const ok = await saveStory(story);
    setSaving(false);
    if (ok) {
      setDirty(false);
      showToast("Saved!");
    } else {
      showToast("Save failed");
    }
  }

  // Find orphan nodes (not reachable from any choice) and dangling refs
  const referencedIds = new Set<string>();
  for (const node of Object.values(story)) {
    for (const choice of node.choices) {
      referencedIds.add(choice.next);
    }
  }
  const orphans = nodeIds.filter(
    (id) => id !== "start" && !referencedIds.has(id)
  );
  const danglingRefs = new Set<string>();
  for (const node of Object.values(story)) {
    for (const choice of node.choices) {
      if (choice.next && !nodeIds.includes(choice.next)) {
        danglingRefs.add(choice.next);
      }
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Story Editor</h1>
          <p className="text-sm text-stone-400 mt-1">
            {nodeIds.length} nodes
            {orphans.length > 0 && (
              <span className="text-amber-400">
                {" "}
                &middot; {orphans.length} orphan
                {orphans.length !== 1 && "s"}
              </span>
            )}
            {danglingRefs.size > 0 && (
              <span className="text-red-400">
                {" "}
                &middot; {danglingRefs.size} missing target
                {danglingRefs.size !== 1 && "s"}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="rounded-lg border border-stone-700 px-4 py-2 text-sm hover:bg-stone-800 transition"
          >
            Back to Admin
          </a>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium transition hover:bg-green-600 disabled:opacity-40"
          >
            {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </div>

      {/* Warnings */}
      {danglingRefs.size > 0 && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm">
          <p className="font-medium text-red-400 mb-1">Missing target nodes</p>
          <p className="text-stone-400">
            These are referenced in choices but don&apos;t exist yet:{" "}
            {[...danglingRefs].map((ref, i) => (
              <span key={ref}>
                {i > 0 && ", "}
                <code
                  className="text-red-300 cursor-pointer hover:underline"
                  onClick={() => {
                    setNewNodeId(ref);
                  }}
                >
                  {ref}
                </code>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Add node */}
      <div className="mb-6 flex gap-2">
        <input
          value={newNodeId}
          onChange={(e) => setNewNodeId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNode()}
          placeholder="New node ID (e.g. secret_garden)"
          className="flex-1 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-sm font-mono focus:border-amber-500 focus:outline-none"
        />
        <button
          onClick={addNode}
          disabled={!newNodeId.trim()}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm transition hover:bg-blue-600 disabled:opacity-40"
        >
          + Node
        </button>
        <button
          onClick={addComingSoonNode}
          disabled={!newNodeId.trim()}
          className="rounded-lg border border-amber-700 bg-amber-900/30 px-4 py-2 text-sm text-amber-400 transition hover:bg-amber-900/50 disabled:opacity-40"
        >
          + Placeholder
        </button>
      </div>

      {/* Node list */}
      <div className="space-y-2">
        {nodeIds.map((id) => (
          <NodeEditor
            key={id}
            nodeId={id}
            node={story[id]}
            allNodeIds={nodeIds}
            onUpdate={update}
            onDelete={deleteNode}
            onRename={renameNode}
          />
        ))}
      </div>
    </main>
  );
}
