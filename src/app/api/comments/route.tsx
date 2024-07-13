// D:\web-chat\src\app\api\comments\route.tsx
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const assetsFilePath = path.join(process.cwd(), 'src', 'app', 'assets', 'assets.json');

type Asset = {
  postId: number;
  id: number;
  name?: string;
  email?: string;
  like: number;
  body: string;
  userId?: number;
};

function readAssets(): Asset[] {
  const fileContents = fs.readFileSync(assetsFilePath, 'utf8');
  return JSON.parse(fileContents);
}

function writeAssets(data: Asset[]) {
  fs.writeFileSync(assetsFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(req: NextRequest) {
  const assets = readAssets();
  const comments = assets.filter((asset: Asset) => asset.body); // Assuming comments have a body property
  return new Response(JSON.stringify(comments), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const { type, postId, likes, body, userId } = await req.json();
  const assets = readAssets();

  if (type === 'like') {
    const post = assets.find((p) => p.id === postId);
    if (post) {
      post.like = likes;
      writeAssets(assets);
      return new Response(JSON.stringify(post), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: 'Post not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    const newComment = { id: Date.now(), postId, body, userId, like: 0 };
    assets.push(newComment);
    writeAssets(assets);
    return new Response(JSON.stringify(newComment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
