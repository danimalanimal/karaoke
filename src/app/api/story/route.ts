import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { Story } from "@/lib/types";

const STORY_PATH = join(process.cwd(), "data", "story.json");
const KV_KEY = "story";

function useKV(): boolean {
  return !!process.env.KV_REST_API_URL;
}

async function readStory(): Promise<Story> {
  if (useKV()) {
    const data = await kv.get<Story>(KV_KEY);
    if (data) return data;
    // Seed KV from the bundled JSON on first run
    const raw = await readFile(STORY_PATH, "utf-8");
    const story = JSON.parse(raw) as Story;
    await kv.set(KV_KEY, story);
    return story;
  }
  const raw = await readFile(STORY_PATH, "utf-8");
  return JSON.parse(raw) as Story;
}

async function writeStory(story: Story): Promise<void> {
  if (useKV()) {
    await kv.set(KV_KEY, story);
    return;
  }
  await writeFile(STORY_PATH, JSON.stringify(story, null, 2) + "\n");
}

export async function GET() {
  const story = await readStory();
  return NextResponse.json(story);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Story;
  await writeStory(body);
  return NextResponse.json({ ok: true });
}
