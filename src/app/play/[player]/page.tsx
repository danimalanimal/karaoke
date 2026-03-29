"use client";

import { use, useEffect, useState, useCallback } from "react";
import { getNode } from "@/lib/story";
import { loadProgress, saveProgress } from "@/lib/progress";
import type { PlayerProgress, StoryNode } from "@/lib/types";

export default function PlayPage({
  params,
}: {
  params: Promise<{ player: string }>;
}) {
  const { player } = use(params);
  const decodedPlayer = decodeURIComponent(player);

  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [node, setNode] = useState<StoryNode | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const p = loadProgress(decodedPlayer);
    setProgress(p);
    setNode(getNode(p.currentNode));
    setTimeout(() => setFadeIn(true), 50);
  }, [decodedPlayer]);

  const handleChoice = useCallback(
    (nextNodeId: string) => {
      if (!progress) return;
      setFadeIn(false);
      setTimeout(() => {
        const updated: PlayerProgress = {
          ...progress,
          currentNode: nextNodeId,
          history: [...progress.history, progress.currentNode],
          updatedAt: new Date().toISOString(),
        };
        saveProgress(updated);
        setProgress(updated);
        setNode(getNode(nextNodeId));
        setFadeIn(true);
      }, 300);
    },
    [progress]
  );

  if (!node || !progress) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div
        className={`max-w-lg text-center transition-opacity duration-500 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="mb-10 text-xl leading-relaxed">{node.text}</p>

        {node.isComingSoon ? (
          <p className="text-lg italic text-amber-400">
            {node.comingSoonMessage ?? "To be continued..."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {node.choices.map((choice) => (
              <button
                key={choice.next}
                onClick={() => handleChoice(choice.next)}
                className="rounded-lg border border-stone-700 bg-stone-900 px-6 py-3 text-lg transition hover:border-amber-500 hover:bg-stone-800"
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        <p className="mt-12 text-sm text-stone-600">
          Playing as {decodedPlayer}
        </p>
      </div>
    </main>
  );
}
