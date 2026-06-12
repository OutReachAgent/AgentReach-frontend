'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useOutreachStore } from '@/store/useOutreachStore';
import { useState } from 'react';
import {
  Mail,
  Plus,
  Play,
  Trash2,
  X,
  Sparkles,
  Users,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckSquare,
  ChevronRight,
} from 'lucide-react';

export default function EmailCampaignsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();

  const [activeTab, setActiveTab] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Wizard Creation State
  const [wizardStep, setWizardStep] = useState(1); // 1: Name, 2: Template selection/generation, 3: Contacts selection
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // AI Generator Form State
  const [aiGoal, setAiGoal] = useState('');
  const [aiAudience, setAiAudience] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiInstructions, setAiInstructions] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<any | null>(null);

  // Add Contacts modal in campaign details
  const [isAddContactsOpen, setIsAddContactsOpen] = useState(false);
  const [addContactsSearch, setAddContactsSearch] = useState('');
  const [addSelectedContactIds, setAddSelectedContactIds] = useState<string[]>([]);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: isCampaignsLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: api.emailCampaigns.list,
  });

  // Fetch single campaign details
  const { data: campaignDetails, isLoading: isCampaignDetailsLoading } = useQuery({
    queryKey: ['email-campaign', selectedCampaignId],
    queryFn: () => (selectedCampaignId ? api.emailCampaigns.get(selectedCampaignId) : null),
    enabled: !!selectedCampaignId,
    refetchInterval: (query) => {
      // Refetch single campaign detail more often if it's currently running to show live logs!
      return query.state.data?.status === 'RUNNING' ? 2000 : false;
    },
  });

  // Fetch templates for selection
  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: api.templates.list,
  });

  // Fetch contacts for wizard selection
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: api.contacts.list,
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: api.emailCampaigns.create,
    onSuccess: (newCampaign) => {
      // Associate selected contacts
      if (selectedContactIds.length > 0) {
        api.emailCampaigns.addContacts(newCampaign.id, selectedContactIds).then(() => {
          queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
        });
      }
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      showAlert('Campaign created successfully!', 'success');
      resetWizard();
      setActiveTab('list');
    },
    onError: (err: any) => {
      showAlert(err.message || 'Failed to create campaign', 'error');
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: api.emailCampaigns.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      showAlert('Campaign deleted successfully!', 'success');
      if (activeTab === 'detail') setActiveTab('list');
    },
    onError: (err: any) => {
      showAlert(err.message || 'Failed to delete campaign', 'error');
    },
  });

  const launchCampaignMutation = useMutation({
    mutationFn: api.emailCampaigns.launch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      if (selectedCampaignId) {
        queryClient.invalidateQueries({ queryKey: ['email-campaign', selectedCampaignId] });
      }
      showAlert('Campaign delivery launched in background!', 'success');
    },
    onError: (err: any) => {
      showAlert(err.message || 'Failed to launch campaign', 'error');
    },
  });

  const generateAiTemplateMutation = useMutation({
    mutationFn: api.templates.generate,
    onSuccess: (res) => {
      setGeneratedTemplate(res);
      setSelectedTemplateId(res.id);
      showAlert('AI Email Template generated and saved!', 'success');
    },
    onError: (err: any) => {
      showAlert(err.message || 'Failed to generate AI template', 'error');
    },
  });

  const addContactsMutation = useMutation({
    mutationFn: ({ id, contactIds }: { id: string; contactIds: string[] }) =>
      api.emailCampaigns.addContacts(id, contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaign', selectedCampaignId] });
      showAlert('Contacts added to campaign successfully!', 'success');
      setIsAddContactsOpen(false);
      setAddSelectedContactIds([]);
    },
    onError: (err: any) => {
      showAlert(err.message || 'Failed to add contacts', 'error');
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: ({ id, contactId }: { id: string; contactId: string }) =>
      api.emailCampaigns.removeContact(id, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaign', selectedCampaignId] });
      showAlert('Contact removed from campaign.', 'info');
    },
    onError: (err: any) => {
      showAlert(err.message || 'Failed to remove contact', 'error');
    },
  });

  const handleLaunchCampaign = (id: string) => {
    launchCampaignMutation.mutate(id);
  };

  const handleCreateCampaignSubmit = () => {
    if (!campaignName.trim()) {
      showAlert('Please specify a campaign name', 'error');
      return;
    }
    if (!selectedTemplateId) {
      showAlert('Please select or generate a template', 'error');
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      templateId: selectedTemplateId,
    });
  };

  const resetWizard = () => {
    setWizardStep(1);
    setCampaignName('');
    setSelectedTemplateId(null);
    setSelectedContactIds([]);
    setAiGoal('');
    setAiAudience('');
    setAiTone('Professional');
    setAiInstructions('');
    setGeneratedTemplate(null);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(
      selectedContactIds.includes(id)
        ? selectedContactIds.filter((cid) => cid !== id)
        : [...selectedContactIds, id]
    );
  };

  const selectAllContacts = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map((c: any) => c.id));
    }
  };

  const toggleAddContactSelection = (id: string) => {
    setAddSelectedContactIds(
      addSelectedContactIds.includes(id)
        ? addSelectedContactIds.filter((cid) => cid !== id)
        : [...addSelectedContactIds, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Mail className="h-8 w-8 text-indigo-400" />
            Email Campaigns
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Automate personalized bulk outreach pipelines with tracking and AI copies.
          </p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => {
              resetWizard();
              setActiveTab('create');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Campaign
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

      {/* Main Campaign List Tab */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCampaignsLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-zinc-900 border border-zinc-850 rounded-2xl animate-pulse"></div>
            ))
          ) : campaigns.length > 0 ? (
            campaigns.map((camp: any) => {
              const statusColors: Record<string, string> = {
                DRAFT: 'bg-zinc-850 text-zinc-400 border-zinc-800',
                RUNNING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10',
                COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
                FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/10',
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
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            if (confirm('Delete this campaign?')) {
                              deleteCampaignMutation.mutate(camp.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{camp.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">Created on {new Date(camp.createdAt).toLocaleDateString()}</p>
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
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </button>
                    {camp.status === 'DRAFT' && (
                      <button
                        onClick={() => handleLaunchCampaign(camp.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Launch
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-zinc-850 bg-zinc-900/20 rounded-2xl text-zinc-500">
              No campaigns configured. Click &quot;New Campaign&quot; to build an outreach pipeline.
            </div>
          )}
        </div>
      )}

      {/* Campaign Details Tab */}
      {activeTab === 'detail' && selectedCampaignId && (
        <div className="space-y-6">
          {isCampaignDetailsLoading || !campaignDetails ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-16 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
              <div className="h-80 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Banner */}
              <div className="p-6 bg-zinc-900/50 border border-zinc-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{campaignDetails.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                      {campaignDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Template: <span className="text-zinc-300 font-semibold">{campaignDetails.template?.name || 'No Template'}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsAddContactsOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Add Contacts
                  </button>
                  {campaignDetails.status === 'DRAFT' && (
                    <button
                      onClick={() => handleLaunchCampaign(campaignDetails.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow-md hover:brightness-110"
                    >
                      <Play className="h-3.5 w-3.5" /> Launch Campaign
                    </button>
                  )}
                </div>
              </div>

              {/* Contacts Table in Campaign */}
              <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-zinc-850 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Campaign Recipients</h4>
                  <span className="text-xs text-zinc-500 font-medium">Total: {campaignDetails.contacts?.length || 0}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="text-xs text-zinc-500 uppercase border-b border-zinc-850 bg-zinc-900/60">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Recipient</th>
                        <th className="px-6 py-3.5 font-semibold">Email</th>
                        <th className="px-6 py-3.5 font-semibold">Delivery</th>
                        <th className="px-6 py-3.5 font-semibold">Opens</th>
                        <th className="px-6 py-3.5 font-semibold">Replies</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {campaignDetails.contacts && campaignDetails.contacts.length > 0 ? (
                        campaignDetails.contacts.map((cc: any) => {
                          const deliveryColors: Record<string, string> = {
                            PENDING: 'bg-zinc-850 text-zinc-400',
                            SENT: 'bg-blue-500/10 text-blue-400',
                            DELIVERED: 'bg-emerald-500/10 text-emerald-400',
                            FAILED: 'bg-rose-500/10 text-rose-400',
                          };

                          return (
                            <tr key={cc.id} className="hover:bg-zinc-900/40 transition-colors">
                              <td className="px-6 py-4 font-semibold text-white">
                                {cc.contact.firstName} {cc.contact.lastName}
                              </td>
                              <td className="px-6 py-4 text-zinc-400">{cc.contact.email}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deliveryColors[cc.deliveryStatus] || deliveryColors.PENDING}`}>
                                  {cc.deliveryStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {cc.openStatus ? (
                                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5" /> Opened
                                  </span>
                                ) : (
                                  <span className="text-zinc-650">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {cc.replyStatus ? (
                                  <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                                    <CheckCircle className="h-3.5 w-3.5" /> Replied
                                  </span>
                                ) : (
                                  <span className="text-zinc-650">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  disabled={campaignDetails.status === 'RUNNING'}
                                  onClick={() => {
                                    if (confirm('Remove this contact from the campaign?')) {
                                      removeContactMutation.mutate({ id: campaignDetails.id, contactId: cc.contactId });
                                    }
                                  }}
                                  className="p-1 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 rounded transition-colors disabled:opacity-30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                            No recipients attached to this campaign. Click &quot;Add Contacts&quot; to build the recipient list.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Wizard Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6 max-w-3xl bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl shadow-xl">
          {/* Wizard step banner */}
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-850">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep === 1 ? 'bg-indigo-500 text-white' : 'bg-zinc-850 text-zinc-400'}`}>1</div>
            <div className="h-px bg-zinc-800 flex-1"></div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep === 2 ? 'bg-indigo-500 text-white' : 'bg-zinc-850 text-zinc-400'}`}>2</div>
            <div className="h-px bg-zinc-800 flex-1"></div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep === 3 ? 'bg-indigo-500 text-white' : 'bg-zinc-850 text-zinc-400'}`}>3</div>
          </div>

          {/* STEP 1: Campaign Details */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 SaaS Founder Cold Outreach"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!campaignName.trim()) {
                      showAlert('Please specify a campaign name', 'error');
                      return;
                    }
                    setWizardStep(2);
                  }}
                  className="flex items-center gap-1 px-5 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white rounded-xl shadow-md"
                >
                  Choose Template <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Template Selection / Generation */}
          {wizardStep === 2 && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Predefined/Custom templates */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Pre-existing Template</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {templates.map((tpl: any) => (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedTemplateId === tpl.id
                            ? 'border-indigo-500 bg-indigo-500/5 text-white'
                            : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/40'
                        }`}
                      >
                        <p className="text-sm font-bold truncate">{tpl.name}</p>
                        <p className="text-xs text-zinc-500 truncate mt-1">{tpl.subject}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Generator Panel */}
                <div className="space-y-4 border-l border-zinc-850 pl-6">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 text-purple-400">
                    <Sparkles className="h-3.5 w-3.5" /> Generate Template with AI
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">What is the goal of this outreach?</label>
                      <input
                        type="text"
                        placeholder="e.g. Schedule a demo for our automation services"
                        value={aiGoal}
                        onChange={(e) => setAiGoal(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Who is the target audience?</label>
                      <input
                        type="text"
                        placeholder="e.g. Tech Founders & Engineering Leaders"
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Tone</label>
                        <select
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                        >
                          <option>Professional</option>
                          <option>Casual</option>
                          <option>Direct</option>
                          <option>Enthusiastic</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={generateAiTemplateMutation.isPending}
                      onClick={() =>
                        generateAiTemplateMutation.mutate({
                          goal: aiGoal,
                          audience: aiAudience,
                          tone: aiTone,
                          instructions: aiInstructions,
                        })
                      }
                      className="w-full py-2 bg-gradient-to-tr from-purple-500 via-purple-600 to-indigo-500 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10 hover:brightness-110 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {generateAiTemplateMutation.isPending ? 'Generating copy...' : 'Generate and select copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Show generated preview if generated */}
              {generatedTemplate && (
                <div className="mt-4 p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-purple-400">Generated Email Template Preview</p>
                  <p className="text-sm font-semibold text-white">Subject: {generatedTemplate.subject}</p>
                  <div className="text-xs text-zinc-400 leading-relaxed max-h-32 overflow-y-auto bg-zinc-900/40 p-3 rounded-lg border border-zinc-850 font-mono whitespace-pre-wrap">
                    {generatedTemplate.bodyText}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-850 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTemplateId) {
                      showAlert('Please select or generate a template first', 'error');
                      return;
                    }
                    setWizardStep(3);
                  }}
                  className="flex items-center gap-1 px-5 py-2 bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white rounded-xl"
                >
                  Select Contacts <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contacts Selection */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recipient List Selection</h4>
                <button
                  type="button"
                  onClick={selectAllContacts}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  {selectedContactIds.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="border border-zinc-850 rounded-xl bg-zinc-950/40 divide-y divide-zinc-850 max-h-[300px] overflow-y-auto">
                {contacts.length > 0 ? (
                  contacts.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => toggleContactSelection(c.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/40 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{c.email} • {c.company || 'No Company'}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        selectedContactIds.includes(c.id)
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-zinc-800 bg-zinc-950'
                      }`}>
                        {selectedContactIds.includes(c.id) && <CheckSquare className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No contacts found. Please import contacts first.
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-850 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreateCampaignSubmit}
                  disabled={createCampaignMutation.isPending}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  Create and Save Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Contacts Modal in Campaign Details */}
      {isAddContactsOpen && selectedCampaignId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white">Add Contacts to Campaign</h3>
              <button
                onClick={() => {
                  setIsAddContactsOpen(false);
                  setAddSelectedContactIds([]);
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Search contacts by name or email..."
                value={addContactsSearch}
                onChange={(e) => setAddContactsSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />

              <div className="border border-zinc-850 rounded-xl bg-zinc-950/40 divide-y divide-zinc-850 max-h-[300px] overflow-y-auto">
                {contacts
                  // Filter out contacts already in campaign
                  .filter((c: any) => {
                    const alreadyInCampaign = campaignDetails?.contacts?.some((cc: any) => cc.contactId === c.id);
                    const matchSearch =
                      c.firstName.toLowerCase().includes(addContactsSearch.toLowerCase()) ||
                      c.lastName.toLowerCase().includes(addContactsSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(addContactsSearch.toLowerCase());
                    return !alreadyInCampaign && matchSearch;
                  })
                  .map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => toggleAddContactSelection(c.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-900/40 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{c.firstName} {c.lastName}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{c.email}</p>
                      </div>
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                        addSelectedContactIds.includes(c.id)
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-zinc-800 bg-zinc-950'
                      }`}>
                        {addSelectedContactIds.includes(c.id) && <CheckSquare className="h-3 w-3" />}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddContactsOpen(false);
                    setAddSelectedContactIds([]);
                  }}
                  className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={addSelectedContactIds.length === 0}
                  onClick={() => addContactsMutation.mutate({ id: selectedCampaignId, contactIds: addSelectedContactIds })}
                  className="px-4 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-semibold text-white rounded-xl shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                >
                  Add Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
