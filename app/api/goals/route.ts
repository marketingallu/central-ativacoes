import { NextRequest, NextResponse } from 'next/server';
import getSql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const sql = getSql();
  try {
    await sql`CREATE TABLE IF NOT EXISTS dispatch_goals (date DATE PRIMARY KEY, goal INTEGER NOT NULL DEFAULT 0)`;
  } catch (e) { console.error('create table:', e); }
  try {
    if (!month) return NextResponse.json({ data: [] });
    const [year, m] = month.split('-');
    const rows = await sql`
      SELECT date::text, goal FROM dispatch_goals
      WHERE EXTRACT(YEAR FROM date) = ${year} AND EXTRACT(MONTH FROM date) = ${m}
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('goals GET error:', err);
    return NextResponse.json({ data: [] });
  }
}

export async function PUT(req: NextRequest) {
  const sql = getSql();
  try {
    await sql`CREATE TABLE IF NOT EXISTS dispatch_goals (date DATE PRIMARY KEY, goal INTEGER NOT NULL DEFAULT 0)`;
  } catch (e) { console.error('create table:', e); }
  try {
    const { date, goal } = await req.json();
    const val = Number(goal);
    if (!val || val <= 0) {
      await sql`DELETE FROM dispatch_goals WHERE date = ${date}`;
    } else {
      await sql`
        INSERT INTO dispatch_goals (date, goal) VALUES (${date}, ${val})
        ON CONFLICT (date) DO UPDATE SET goal = ${val}
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('goals PUT error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
