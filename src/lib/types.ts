export interface Choice {
  label: string;
  next: string;
}

export interface StoryNode {
  text: string;
  choices: Choice[];
  isComingSoon?: boolean;
  comingSoonMessage?: string;
}

export type Story = Record<string, StoryNode>;

export interface PlayerProgress {
  player: string;
  currentNode: string;
  history: string[];
  updatedAt: string;
}
