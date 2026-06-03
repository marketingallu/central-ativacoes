import { NextRequest, NextResponse } from 'next/server';
import { getRevenue } from '@/lib/bigquery-revenue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const month = new URL(req.url).searchParams.get('month'); // "2026-06"
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'Param month obrigatório (YYYY-MM)' }, { status: 400 });
  }

  const [year, m] = month.split('-').map(Number);
  const start = `${year}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(year, m, 0).getDate();
  const end = `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  try {
    const data = await getRevenue(start, end);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[/api/revenue] erro:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
