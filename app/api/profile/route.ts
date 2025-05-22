// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // Row not found
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { displayName, bio } = body;

  if (bio && bio.length > 200) {
    return NextResponse.json({ error: 'Bio must be ≤ 200 characters' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      display_name: displayName,
      bio,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  return NextResponse.json(data);
}
