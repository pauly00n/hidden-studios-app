// src/app/api/fortnite/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const fortniteRes = await fetch(`https://fortnite.gg/player-count-graph?range=1m&id=${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      // No credentials or CORS headers needed on server-side
    });

    const data = await fortniteRes.json();

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch Fortnite data' }, { status: 500 });
  }
}
