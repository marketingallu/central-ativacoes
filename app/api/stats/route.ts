import { NextRequest, NextResponse } from 'next/server';
import getSql from '@/lib/db';

export const dynamic = 'force-dynamic';

const EMPTY = {
  activation_count: 0, total_base: 0,
  whatsapp_base: 0, whatsapp_sent: 0,
  sent: 0, delivered: 0, read_count: 0, replied: 0,
  gross_sales: 0, net_sales: 0,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const type = searchParams.get('type');
  const sql = getSql();
  const tf = type && type !== 'all' ? type : null;

  // ensure column exists
  try { await sql`ALTER TABLE activations ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}'`; } catch { /* ignore */ }

  const buildSelect = () => sql`
    COUNT(*)::int as activation_count,
    COALESCE(SUM(segment_volume),0)::bigint as total_base,
    COALESCE(SUM(CASE WHEN type='whatsapp' THEN segment_volume ELSE 0 END),0)::bigint as whatsapp_base,
    COALESCE(SUM(CASE WHEN type='whatsapp' THEN COALESCE((results->>'sent')::numeric,0) ELSE 0 END),0)::bigint as whatsapp_sent,
    COALESCE(SUM(COALESCE((results->>'sent')::numeric,0)),0)::bigint as sent,
    COALESCE(SUM(COALESCE((results->>'delivered')::numeric,0)),0)::bigint as delivered,
    COALESCE(SUM(COALESCE((results->>'read')::numeric,0)),0)::bigint as read_count,
    COALESCE(SUM(COALESCE((results->>'replied')::numeric,0)),0)::bigint as replied,
    COALESCE(SUM(COALESCE((results->>'gross_sales')::numeric,0)),0)::numeric as gross_sales,
    COALESCE(SUM(COALESCE((results->>'net_sales')::numeric,0)),0)::numeric as net_sales
  `;

  try {
    let rows;
    if (month && tf) {
      const [y, m] = month.split('-');
      rows = await sql`SELECT ${buildSelect()} FROM activations WHERE EXTRACT(YEAR FROM date)=${y} AND EXTRACT(MONTH FROM date)=${m} AND type=${tf}`;
    } else if (month) {
      const [y, m] = month.split('-');
      rows = await sql`SELECT ${buildSelect()} FROM activations WHERE EXTRACT(YEAR FROM date)=${y} AND EXTRACT(MONTH FROM date)=${m}`;
    } else if (tf) {
      rows = await sql`SELECT ${buildSelect()} FROM activations WHERE type=${tf}`;
    } else {
      rows = await sql`SELECT ${buildSelect()} FROM activations`;
    }
    return NextResponse.json({ data: rows[0] ?? EMPTY });
  } catch (err) {
    console.error('stats error:', err);
    return NextResponse.json({ data: EMPTY });
  }
}
