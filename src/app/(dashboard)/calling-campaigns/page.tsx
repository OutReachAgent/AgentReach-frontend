'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LooseApiResponse } from '@/lib/api';
import { useOutreachStore } from '@/store/useOutreachStore';
import { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Play,
  User,
  Volume2,
  Clock,
  MessageSquare,
  Pause,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function CallingCampaignsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();

  const [activeTab, setActiveTab] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Audio Player Simulation
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  
  // Expanded Transcript Collapsible
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  // Create Campaign State
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState('female-us-1');
  const [language, setLanguage] = useState('English');

  // Fetch campaigns list
  const { data: campaigns = [], isLoading: isListLoading } = useQuery({
    queryKey: ['calling-campaigns'],
    queryFn: api.callingCampaigns.list,
  });

  // Fetch single campaign details
  const { data: campaignDetails, isLoading: isDetailLoading } = useQuery({
    queryKey: ['calling-campaign', selectedCampaignId],
    queryFn: () => (selectedCampaignId ? api.callingCampaigns.get(selectedCampaignId) : null),
    enabled: !!selectedCampaignId,
    refetchInterval: (query) => {
      // Fast refetch when simulation is running to show real-time call updates!
      return query.state.data?.status === 'RUNNING' ? 2000 : false;
    },
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: api.callingCampaigns.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calling-campaigns'] });
      showAlert('Your calling campaign is saved and ready.', 'success', 'Campaign ready');
      resetForm();
      setActiveTab('list');
    },
    onError: (err: Error) => {
      showAlert(err.message || 'We could not save this calling campaign. Please check the details and try again.', 'error');
    },
  });

  const launchCampaignMutation = useMutation({
    mutationFn: api.callingCampaigns.launch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calling-campaigns'] });
      if (selectedCampaignId) {
        queryClient.invalidateQueries({ queryKey: ['calling-campaign', selectedCampaignId] });
      }
      showAlert('The calling simulation has started. Results will appear as calls finish.', 'success', 'Calling started');
    },
    onError: (err: Error) => {
      showAlert(err.message || 'We could not start the calling campaign. Please add contacts first.', 'error');
    },
  });

  const resetForm = () => {
    setName('');
    setObjective('');
    setPrompt('');
    setVoice('female-us-1');
    setLanguage('English');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Please enter a campaign name so you can recognize it later.', 'error');
      return;
    }

    createCampaignMutation.mutate({
      name,
      objective,
      prompt,
      voice,
      language,
    });
  };

  // Convert transcript text into readable structured conversation bubbles
  const renderTranscriptBubbles = (transcriptText: string) => {
    if (!transcriptText) return <p className="text-xs text-zinc-500 italic">No conversational transcript recorded.</p>;

    // Expected format: "Agent: Hello... Customer: Hi..."
    const lines = transcriptText.split('\n').filter(l => l.trim());
    return (
      <div className="space-y-3 pt-2">
        {lines.map((line, idx) => {
          const isAgent = line.startsWith('Agent:');
          const cleanText = line.replace(/^(Agent:|Customer:)/, '').trim();

          return (
            <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                  isAgent
                    ? 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none'
                    : 'bg-indigo-600 text-white rounded-br-none'
                }`}
              >
                <span className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                  {isAgent ? 'AI Agent' : 'Contact'}
                </span>
                {cleanText}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <PhoneCall className="h-8 w-8 text-indigo-400" />
            AI calling Campaigns
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Configure automated calling schedules with voice simulation agents and detailed transcript logs.
          </p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => {
              resetForm();
              setActiveTab('create');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Campaign
          </button>
        )}
        {activeTab !== 'list' && (
          <button
            onClick={() => setActiveTab('list')}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all"
          >
            Back to Campaigns
          </button>
        )}
      </div>

      {/* Campaign List Tab */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isListLoading ? (
            [1, 2].map((n) => (
              <div key={n} className="h-48 bg-zinc-900 border border-zinc-850 rounded-2xl animate-pulse"></div>
            ))
          ) : campaigns.length > 0 ? (
            campaigns.map((camp: LooseApiResponse) => {
              const statusColors: Record<string, string> = {
                DRAFT: 'bg-zinc-850 text-zinc-400 border-zinc-800',
                RUNNING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10',
                COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
              };

              return (
                <div
                  key={camp.id}
                  className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:bg-zinc-900/60 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[camp.status] || statusColors.DRAFT}`}>
                        {camp.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{camp.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{camp.objective || 'No objective set'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-850/65 pt-4 mt-6">
                    <button
                      onClick={() => {
                        setSelectedCampaignId(camp.id);
                        setActiveTab('detail');
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      View Calls
                    </button>
                    {camp.status === 'DRAFT' && (
                      <button
                        onClick={() => launchCampaignMutation.mutate(camp.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Start Dialer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-zinc-850 bg-zinc-900/20 rounded-2xl text-zinc-500">
              No calling campaigns configured. Click &quot;Create Campaign&quot; to build an automated dialer pipeline.
            </div>
          )}
        </div>
      )}

      {/* Campaign Details Tab */}
      {activeTab === 'detail' && selectedCampaignId && (
        <div className="space-y-6">
          {isDetailLoading || !campaignDetails ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-16 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
              <div className="h-80 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Campaign summary card */}
              <div className="p-6 bg-zinc-900/50 border border-zinc-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{campaignDetails.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-850 text-zinc-400">
                      {campaignDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Objective: {campaignDetails.objective || 'No objective set'}</p>
                </div>
                {campaignDetails.status === 'DRAFT' && (
                  <button
                    onClick={() => launchCampaignMutation.mutate(campaignDetails.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow-md hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5" /> Start Dialer Run
                  </button>
                )}
              </div>

              {/* Calls List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Dialed Call Logs</h4>
                
                {campaignDetails.calls && campaignDetails.calls.length > 0 ? (
                  <div className="space-y-4">
                    {campaignDetails.calls.map((call: LooseApiResponse) => {
                      const isExpanded = expandedCallId === call.id;
                      const isPlaying = playingCallId === call.id;
                      
                      const outcomeColors: Record<string, string> = {
                        PENDING: 'bg-zinc-850 text-zinc-400',
                        ANSWERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
                        NO_ANSWER: 'bg-zinc-800 text-zinc-500 border-zinc-800',
                        BUSY: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
                        FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/10',
                      };

                      return (
                        <div
                          key={call.id}
                          className="bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl"
                        >
                          {/* Log Bar */}
                          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-400 border border-zinc-850">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {call.contact.firstName} {call.contact.lastName}
                                </p>
                                <p className="text-xs text-zinc-500">{call.contact.email} • {call.contact.phoneNumber || 'No phone'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${outcomeColors[call.outcome]}`}>
                                {call.outcome}
                              </span>

                              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                {call.duration}s
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Play/Pause Recording */}
                                {call.outcome === 'ANSWERED' && (
                                  <button
                                    onClick={() => setPlayingCallId(isPlaying ? null : call.id)}
                                    className={`p-1.5 rounded-xl border transition-all ${
                                      isPlaying
                                        ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse'
                                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                                  </button>
                                )}

                                {/* Collapsible Toggle */}
                                <button
                                  onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                                  className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all"
                                >
                                  {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Recording waves simulation */}
                          {isPlaying && (
                            <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-850 flex items-center gap-4">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Recording</span>
                              <div className="flex-1 flex items-end gap-0.5 h-6">
                                {[...Array(36)].map((_, i) => {
                                  // Random wave heights
                                  const h = Math.floor(Math.random() * 16) + 4;
                                  return (
                                    <div
                                      key={i}
                                      className="flex-1 bg-indigo-500 rounded-full transition-all duration-300"
                                      style={{ height: `${h}px` }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Collapsible content (transcript) */}
                          {isExpanded && (
                            <div className="p-6 bg-zinc-950/30 border-t border-zinc-850 space-y-4">
                              <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                Conversational Transcript
                              </h5>
                              {renderTranscriptBubbles(call.transcript)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-500 border border-zinc-850 bg-zinc-900/10 rounded-2xl">
                    No dialed call history recorded. Start the Dialer to simulate voice conversations.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Campaign Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Follow-Up Voice Dialer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Dialer Objective</label>
              <input
                type="text"
                placeholder="e.g. Call leads to schedule product demo bookings"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Agent System Prompt</label>
              <textarea
                placeholder="e.g. You are Sarah from SalesCorp. Be friendly, ask how their automation is going, and request a 15 min follow-up call."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 h-28 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Voice Tone</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="female-us-1">Female (US Accent - Sarah)</option>
                  <option value="male-us-1">Male (US Accent - Mike)</option>
                  <option value="female-uk-1">Female (UK Accent - Emma)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="px-6 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-semibold text-white rounded-xl shadow-md hover:brightness-110"
            >
              Save Campaign
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
