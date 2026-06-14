'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useOutreachStore } from '@/store/useOutreachStore';
import { useState, useEffect } from 'react';
import { Settings, Server, Key, Mail, Check, RefreshCw } from 'lucide-react';

const DEFAULT_OPENROUTER_MODEL = 'nex-agi/nex-n2-pro:free';
const CAMPAIGN_SENDER_EMAIL = 'oswin.alex@oswinalex.site';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();

  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState(DEFAULT_OPENROUTER_MODEL);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
  });

  // Load values once loaded
  useEffect(() => {
    if (settings) {
      queueMicrotask(() => {
        setAwsAccessKeyId(settings.awsAccessKeyId || '');
        setAwsSecretAccessKey(settings.awsSecretAccessKey || '');
        setAwsRegion(settings.awsRegion || 'us-east-1');
        setOpenRouterApiKey(settings.openRouterApiKey || '');
        setOpenRouterModel(settings.openRouterModel || DEFAULT_OPENROUTER_MODEL);
      });
    }
  }, [settings]);

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: api.settings.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showAlert('Your settings have been saved.', 'success', 'Settings saved');
    },
    onError: (err: Error) => {
      showAlert(err.message || 'We could not save your settings. Please check the fields and try again.', 'error');
    },
  });

  const testSesMutation = useMutation({
    mutationFn: api.settings.testSes,
    onSuccess: (res) => {
      if (res.success) {
        showAlert(res.message || 'Your email sending connection is working.', 'success', 'Email settings verified');
      } else {
        showAlert(res.error || 'We could not verify your email sending settings. Please check your AWS details.', 'error');
      }
    },
    onError: (err: Error) => {
      showAlert(err.message || 'We could not test your email sending settings. Please try again.', 'error');
    },
  });

  const testOpenRouterMutation = useMutation({
    mutationFn: api.settings.testOpenRouter,
    onSuccess: (res) => {
      if (res.success) {
        showAlert(res.message || 'Your AI connection is working.', 'success', 'AI settings verified');
      } else {
        showAlert(res.error || 'We could not verify your AI settings. Please check the API key.', 'error');
      }
    },
    onError: (err: Error) => {
      showAlert(err.message || 'We could not test your AI settings. Please try again.', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      awsAccessKeyId,
      awsSecretAccessKey,
      awsRegion,
      awsSenderEmail: CAMPAIGN_SENDER_EMAIL,
      openRouterApiKey,
      openRouterModel,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/4 pb-4 border-b border-zinc-900"></div>
        <div className="h-96 bg-zinc-900 border border-zinc-850 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-5 border-b border-zinc-900">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-indigo-400" />
          System Settings
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Configure API credentials and sender servers for AWS SES and OpenRouter AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AWS SES Panel */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/60">
            <Server className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">AWS Simple Email Service (SES)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                AWS Access Key ID
              </label>
              <input
                type="text"
                value={awsAccessKeyId}
                onChange={(e) => setAwsAccessKeyId(e.target.value)}
                placeholder="AKIA..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                AWS Secret Access Key
              </label>
              <input
                type="password"
                value={awsSecretAccessKey}
                onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                AWS Region
              </label>
              <input
                type="text"
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                placeholder="us-east-1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Sender Email Address
              </label>
              <input
                type="email"
                value={CAMPAIGN_SENDER_EMAIL}
                readOnly
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-3">
            <button
              type="button"
              disabled={testSesMutation.isPending}
              onClick={() => testSesMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testSesMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              Test SES Connection
            </button>
          </div>
        </div>

        {/* OpenRouter Panel */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/60">
            <Key className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">OpenRouter AI Configuration</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Default LLM Model Name
              </label>
              <input
                type="text"
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                placeholder={DEFAULT_OPENROUTER_MODEL}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-3">
            <button
              type="button"
              disabled={testOpenRouterMutation.isPending}
              onClick={() => testOpenRouterMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testOpenRouterMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Key className="h-3.5 w-3.5" />
              )}
              Test OpenRouter API
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {updateSettingsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
