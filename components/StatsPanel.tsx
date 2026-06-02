'use client';
import { useState, useEffect } from 'react';

interface Stats {
  activation_count: number;
  total_base: number;
  whatsapp_base: number;
  whatsapp_sent: number;
  sent: number;
  delivered: number;
  read_count: number;
  replied: number;
  gross_sales: number;
  net_sales: number;
}

interface Props {
  month: string;
  typeFilter: string;
  period: string;
}

const EMPTY: Stats = {
  activation_count: 0, total_base: 0,
  whatsapp_base: 0, whatsapp_sent: 0,
  sent: 0, delivered: 0, read_count: 0, replied: 0,
  gross_sales: 0, net_sales: 0,
};

const fmt = (n: number) => Number(n || 0).toLocaleString('pt-BR');
const fmtBRL = (n: number) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = (part: number, total: number) => total > 0 ? ((part / total) * 100).toFixed(1) + '%' : '—';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function StatsPanel({ month, typeFilter, period }: Props) {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams();
    if (period === 'month') p.set('month', month);
    if (typeFilter && typeFilter !== 'all') p.set('type', typeFilter);
    setLoading(true);
    fetch(`/api/stats?${p}`)
      .then(r => r.json())
      .then(j => setStats(j.data ?? EMPTY))
      .catch(() => setStats(EMPTY))
      .finally(() => setLoading(false));
  }, [month, typeFilter, period]);

  const waBase = Number(stats.whatsapp_base || 0);
  const waSent = Number(stats.whatsapp_sent || 0);
  const costBase = waSent > 0 ? waSent : waBase;
  const costUSD = costBase * 0.06;
  const sentN = Number(stats.sent || 0);

  const skeleton = 'bg-gray-100 rounded animate-pulse h-6 w-24';

  return (
    <div className="space-y-3">
      <Block title="Base disparada">
        {loading
          ? <div className={skeleton} />
          : <>
              <div className="text-2xl font-bold text-[#2E2F39]">{fmt(stats.total_base)}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stats.activation_count} ativação{stats.activation_count !== 1 ? 'ões' : ''}</div>
            </>
        }
      </Block>

      <Block title="Custo WhatsApp">
        {loading
          ? <div className={skeleton} />
          : <>
              <div className="text-2xl font-bold text-[#2E2F39]">${costUSD.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {fmt(costBase)} msgs × $0,06{waSent === 0 && waBase > 0 ? ' (estimado)' : ''}
              </div>
            </>
        }
      </Block>

      <Block title="Métricas de disparo">
        {loading
          ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className={skeleton} />)}</div>
          : <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              {([
                ['Enviadas', stats.sent, null],
                ['Entregues', stats.delivered, sentN],
                ['Lidas', stats.read_count, sentN],
                ['Respondidas', stats.replied, sentN],
              ] as [string, number, number | null][]).map(([label, value, base]) => (
                <div key={label}>
                  <div className="text-[10px] text-gray-400">{label}</div>
                  <div className="text-sm font-bold text-[#2E2F39]">{fmt(value)}</div>
                  {base !== null && <div className="text-[10px] text-[#27AE60]">{pct(Number(value), base)}</div>}
                </div>
              ))}
            </div>
        }
      </Block>

      <Block title="Vendas">
        {loading
          ? <div className="space-y-2">{[1,2].map(i => <div key={i} className={skeleton} />)}</div>
          : <div className="space-y-2">
              <div>
                <div className="text-[10px] text-gray-400">Bruta</div>
                <div className="text-sm font-bold text-[#2E2F39]">{fmtBRL(stats.gross_sales)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Líquida</div>
                <div className="text-sm font-bold text-[#27AE60]">{fmtBRL(stats.net_sales)}</div>
              </div>
            </div>
        }
      </Block>
    </div>
  );
}
