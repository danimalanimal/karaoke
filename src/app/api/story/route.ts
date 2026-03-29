import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const STORY_PATH = join(process.cwd(), "data", "story.json");

export async function GET() {
  const raw = await readFile(STORY_PATH, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

export async function PUT(request: Request) {
  const body = await request.json();
  await writeFile(STORY_PATH, JSON.stringify(body, null, 2) + "\n");
  return NextResponse.json({ ok: true });
}
