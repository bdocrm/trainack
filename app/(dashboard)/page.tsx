import Link from 'next/link';
import db from '@/lib/db';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { TrainingSession } from '@/lib/types';
import {
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckBadgeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

async function getStats() {
  const totalClientsResult = await db.prepare('SELECT COUNT(*) as c FROM clients').get();
  const totalClients = (totalClientsResult as { c: number }).c || 0;
  
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const sessionsResult = await db.prepare("SELECT COUNT(*) as c FROM sessions WHERE \"sessionDate\" >= $1").get(monthStart);
  const sessionsThisMonth = (sessionsResult as { c: number }).c || 0;
  
  const pendingResult = await db.prepare("SELECT COUNT(*) as c FROM sessions WHERE status = 'pending'").get();
  const pending = (pendingResult as { c: number }).c || 0;
  
  const signedResult = await db.prepare("SELECT COUNT(*) as c FROM sessions WHERE status = 'signed'").get();
  const signed = (signedResult as { c: number }).c || 0;
  
  return { totalClients, sessionsThisMonth, pending, signed };
}

async function getRecentSessions() {
  const sessions = (await db.prepare('SELECT * FROM sessions ORDER BY "createdAt" DESC LIMIT 5').all()) as unknown as (TrainingSession & { coveredFeatureIds: string })[];
  const result = [];
  
  for (const s of sessions) {
    const systemResult = await db.prepare('SELECT name FROM systems WHERE id = $1').get(s.systemId);
    const system = systemResult as { name: string } | undefined;
    result.push({
      ...s,
      coveredFeatureIds: JSON.parse(s.coveredFeatureIds as unknown as string || '[]'),
      systemName: system?.name ?? 'Unknown',
    });
  }
  
  return result;
}

async function getMonthlyData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const rows = (await db.prepare(`
    SELECT TO_CHAR(DATE_TRUNC('month', "sessionDate"::date), 'YYYY-MM') as month, COUNT(*)::INTEGER as count
    FROM sessions
    WHERE "sessionDate"::date >= $1::date
    GROUP BY DATE_TRUNC('month', "sessionDate"::date)
    ORDER BY month ASC
  `).all(sixMonthsAgo.toISOString().split('T')[0])) as { month: string; count: number }[];
  return rows;
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentSessions = await getRecentSessions();
  const monthly = await getMonthlyData();
  const maxCount = Math.max(...monthly.map(m => m.count), 1);

  const kpis = [
    { label: 'Total Clients', value: stats.totalClients, icon: UsersIcon, color: 'text-[#160D76] bg-[#160D76]/10' },
    { label: 'Sessions This Month', value: stats.sessionsThisMonth, icon: CalendarDaysIcon, color: 'text-[#4094d9] bg-[#4094d9]/10' },
    { label: 'Pending Acknowledgments', value: stats.pending, icon: ClockIcon, color: 'text-[#F08530] bg-[#F08530]/10' },
    { label: 'Signed Sessions', value: stats.signed, icon: CheckBadgeIcon, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F172A] font-[Sora]">{value}</p>
                <p className="text-sm text-[#64748B] mt-0.5">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-semibold text-[#0F172A] font-[Sora]">Recent Sessions</h2>
            <Link href="/sessions" className="text-sm text-[#4094d9] font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentSessions.length === 0 && (
              <p className="px-6 py-8 text-sm text-[#64748B] text-center">No sessions yet.</p>
            )}
            {recentSessions.map(s => (
              <Link key={s.id} href={`/sessions/${s.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{s.title}</p>
                  <p className="text-xs text-[#64748B]">{s.systemName} · {formatDate(s.sessionDate)}</p>
                </div>
                <Badge status={s.status as 'pending' | 'acknowledged' | 'signed'} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Bar chart + Quick actions */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-4">Sessions (Last 6 Months)</h2>
            <div className="flex items-end gap-2 h-32">
              {monthly.length === 0 && <p className="text-sm text-[#64748B]">No data yet.</p>}
              {monthly.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[#64748B]">{m.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-[#160D76] to-[#4094d9] rounded-t-md"
                    style={{ height: `${(m.count / maxCount) * 96}px` }}
                  />
                  <span className="text-xs text-[#64748B] truncate w-full text-center">
                    {m.month.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-[#0F172A] font-[Sora] mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'New Session', href: '/sessions/new', color: 'bg-[#160D76] text-white hover:bg-[#1E1199]' },
                { label: 'Add System', href: '/systems?new=1', color: 'bg-slate-100 text-[#0F172A] hover:bg-slate-200' },
              ].map(({ label, href, color }) => (
                <Link key={href} href={href} className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${color}`}>
                  <PlusIcon className="w-4 h-4" /> {label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

