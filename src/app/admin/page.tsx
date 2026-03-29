"use client";

import { useState, useEffect } from "react";
import { loadProgress, resetProgress } from "@/lib/progress";
import type { PlayerProgress, Story, StoryNode } from "@/lib/types";

const STORAGE_KEY_PREFIX = "karaoke_progress_";

function getKnownPlayers(): string[] {
  if (typeof window === "undefined") return [];
  const players: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      players.push(key.slice(STORAGE_KEY_PREFIX.length));
    }
  }
  return players.sort();
}

export default function AdminPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [selected, setSelected] = useState<PlayerProgress | null>(null);
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  const [jumpTarget, setJumpTarget] = useState("");

  useEffect(() => {
    fetch("/api/story")
      .then((r) => r.json())
      .then(setStory);
    setPlayers(getKnownPlayers());
  }, []);

  if (!story) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </main>
    );
  }

  const nodeIds = Object.keys(story);

  function selectPlayer(name: string) {
    const p = loadProgress(name);
    setSelected(p);
    setSelectedNode(story![p.currentNode] ?? null);
  }

  function handleReset(player: string) {
    if (!confirm(`Reset progress for "${player}"?`)) return;
    resetProgress(player);
    setSelected(null);
    setSelectedNode(null);
    setPlayers(getKnownPlayers());
  }

  function handleJump() {
    if (!selected || !jumpTarget || !story) return;
    const node = story[jumpTarget];
    if (!node) return alert("Node not found");
    const updated: PlayerProgress = {
      ...selected,
      currentNode: jumpTarget,
      history: [...selected.history, selected.currentNode],
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${updated.player}`,
      JSON.stringify(updated)
    );
    setSelected(updated);
    setSelectedNode(node);
    setJumpTarget("");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin / DM Screen</h1>
        <a
          href="/admin/editor"
          className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
        >
          Story Editor
        </a>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-stone-400">Players</h2>
        {players.length === 0 ? (
          <p className="text-stone-500">
            No players yet. Someone needs to start playing first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <button
                key={p}
                onClick={() => selectPlayer(p)}
                className={`rounded-lg border px-4 py-2 transition ${
                  selected?.player === p
                    ? "border-amber-500 bg-amber-900/30"
                    : "border-stone-700 bg-stone-900 hover:border-stone-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && selectedNode && (
        <section className="max-w-2xl rounded-xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">{selected.player}</h2>

          <div className="mb-4 space-y-2 text-sm">
            <p>
              <span className="text-stone-400">Current node:</span>{" "}
              <code className="rounded bg-stone-800 px-2 py-0.5">
                {selected.currentNode}
              </code>
            </p>
            <p>
              <span className="text-stone-400">Last updated:</span>{" "}
              {new Date(selected.updatedAt).toLocaleString()}
            </p>
            <p>
              <span className="text-stone-400">Path taken:</span>{" "}
              {selected.history.length === 0
                ? "Just started"
                : selected.history.join(" → ")}
            </p>
          </div>

          <div className="mb-4 rounded-lg bg-stone-800 p-4">
            <p className="text-sm text-stone-400">Currently seeing:</p>
            <p className="mt-1">{selectedNode.text}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={jumpTarget}
              onChange={(e) => setJumpTarget(e.target.value)}
              className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm"
            >
              <option value="">Jump to node...</option>
              {nodeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <button
              onClick={handleJump}
              disabled={!jumpTarget}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm transition hover:bg-blue-600 disabled:opacity-40"
            >
              Jump
            </button>
            <button
              onClick={() => handleReset(selected.player)}
              className="rounded-lg bg-red-800 px-4 py-2 text-sm transition hover:bg-red-700"
            >
              Reset Progress
            </button>
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-400">
          All Story Nodes
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {nodeIds.map((id) => {
            const n = story[id];
            return (
              <div
                key={id}
                className={`rounded-lg border p-3 text-sm ${
                  n?.isComingSoon
                    ? "border-amber-700 bg-amber-900/20"
                    : "border-stone-800 bg-stone-900"
                }`}
              >
                <code className="font-bold">{id}</code>
                <p className="mt-1 text-stone-400 line-clamp-2">
                  {n?.text}
                </p>
                <p className="mt-1 text-xs text-stone-600">
                  {n?.isComingSoon
                    ? "Coming soon"
                    : `${n?.choices.length} choice(s)`}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
