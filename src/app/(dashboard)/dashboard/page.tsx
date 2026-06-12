'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Mail,
  Phone,
  Percent,
  Clock,
  TrendingUp,
  Award,
  Users2,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: api.analytics.get,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time campaign tracking!
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-10 bg-zinc-800 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
          <div className="h-96 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-rose-500/20 rounded-2xl text-center px-4">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
          <Settings className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-1">Failed to load analytics</h3>
        <p className="text-sm text-zinc-400 max-w-sm">{(error as Error).message || 'Make sure the NestJS backend is running and database is connected.'}</p>
      </div>
    );
  }

  const { emailMetrics, callingMetrics, campaignPerformance, templatePerformance, segmentPerformance } = data;

  const cardStats = [
    {
      name: 'Emails Sent',
      value: emailMetrics.sent,
      description: `${emailMetrics.delivered} Delivered • ${emailMetrics.failed} Failed`,
      icon: Mail,
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/10',
    },
    {
      name: 'Email Open Rate',
      value: `${emailMetrics.openRate}%`,
      description: `Reply Rate: ${emailMetrics.replyRate}%`,
      icon: Percent,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/10',
    },
    {
      name: 'Calls Made',
      value: callingMetrics.callsMade,
      description: 'AI Voice Campaigns',
      icon: Phone,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10',
    },
    {
      name: 'Call Success Rate',
      value: `${callingMetrics.successRate}%`,
      description: `Avg Duration: ${callingMetrics.averageDuration}s`,
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Outreach Dashboard</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Overview of your active campaigns, mail deliverability, and calling agents performance.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          Live Sync Active
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`p-6 rounded-2xl border bg-zinc-900/40 backdrop-blur-sm shadow-xl flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] hover:bg-zinc-900/60 ${stat.color.split(' ').pop()}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{stat.name}</p>
                  <p className="text-3xl font-black text-white mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${stat.color.split(' ').slice(0, 2).join(' ')}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-4 font-medium">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Performance Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                Campaign Performance
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Compares emails sent versus open responses and replies</p>
            </div>
          </div>
          <div className="h-80 w-full flex-1 min-h-[300px]">
            {campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="sent" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sent" />
                  <Bar dataKey="opens" fill="#a855f7" radius={[4, 4, 0, 0]} name="Opens" />
                  <Bar dataKey="replies" fill="#10b981" radius={[4, 4, 0, 0]} name="Replies" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <p className="text-sm">No campaign data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Segment Performance */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users2 className="h-5 w-5 text-purple-400" />
              Top Company Segments
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Responsiveness sorted by contact organization</p>
          </div>

          <div className="space-y-4 flex-1">
            {segmentPerformance.length > 0 ? (
              segmentPerformance.map((seg: any) => (
                <div key={seg.segment} className="p-3 bg-zinc-900/60 border border-zinc-850/50 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-200 truncate pr-2">{seg.segment}</span>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/10 font-bold">
                      {seg.sent} Sent
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <p className="text-zinc-500">Open Rate</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${seg.openRate}%` }} />
                        </div>
                        <span className="font-bold text-zinc-300">{seg.openRate}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500">Reply Rate</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${seg.replyRate}%` }} />
                        </div>
                        <span className="font-bold text-zinc-300">{seg.replyRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                <p className="text-sm">No segment data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Performance Table */}
      <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              Outreach Template Performance
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Click-through metrics grouped by selected message templates</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
              <tr>
                <th className="pb-3 font-semibold">Template Name</th>
                <th className="pb-3 font-semibold">Campaign Uses</th>
                <th className="pb-3 font-semibold">Open Rate</th>
                <th className="pb-3 font-semibold">Reply Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {templatePerformance.length > 0 ? (
                templatePerformance.map((tpl: any) => (
                  <tr key={tpl.name} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 font-medium text-white">{tpl.name}</td>
                    <td className="py-3.5 text-zinc-400">{tpl.sent} sent</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">{tpl.openRate}%</span>
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${tpl.openRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">{tpl.replyRate}%</span>
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${tpl.replyRate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500 text-xs">
                    No templates have been dispatched in campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
