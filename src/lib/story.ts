import type { Story } from "./types";
import storyData from "../../data/story.json";

export function getStory(): Story {
  return storyData as Story;
}

export function getNode(nodeId: string) {
  const story = getStory();
  return story[nodeId] ?? null;
}

export function getAllNodeIds(): string[] {
  return Object.keys(getStory());
}
