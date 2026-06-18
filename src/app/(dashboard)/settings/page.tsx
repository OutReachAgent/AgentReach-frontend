"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useOutreachStore } from "@/store/useOutreachStore";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Settings,
  Server,
  Key,
  Mail,
  Check,
  RefreshCw,
  Search,
  ChevronDown,
  X,
} from "lucide-react";

const DEFAULT_OPENROUTER_MODEL = "nex-agi/nex-n2-pro:free";
const CAMPAIGN_SENDER_EMAIL = "oswin.alex@oswinalex.site";

/* ------------------------------------------------------------------ */
/*  OpenRouter model combobox (searchable dropdown)                    */
/* ------------------------------------------------------------------ */
function ModelCombobox({
  models,
  value,
  onChange,
  isLoading,
}: {
  models: string[];
  value: string;
  onChange: (model: string) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(
    () => models.filter((m) => m.toLowerCase().includes(search.toLowerCase())),
    [models, search],
  );

  const handleSelect = (model: string) => {
    onChange(model);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / display */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:border-zinc-700 focus:border-indigo-500/50 focus:outline-none"
      >
        <span className={value ? "text-zinc-200" : "text-zinc-500"}>
          {isLoading ? "Loading models…" : value || "Select a model"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-zinc-800/60 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models…"
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Model list */}
          <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-track-zinc-950 scrollbar-thumb-zinc-800">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-zinc-500">
                No models found
              </li>
            ) : (
              filtered.map((model) => (
                <li key={model}>
                  <button
                    type="button"
                    onClick={() => handleSelect(model)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-zinc-900 ${
                      model === value
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {model === value && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                    )}
                    <span className={model === value ? "" : "pl-5"}>
                      {model}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Footer count */}
          <div className="border-t border-zinc-800/60 px-4 py-1.5 text-[11px] text-zinc-600">
            {filtered.length} of {models.length} models
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings page                                                      */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();

  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("us-east-1");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [openRouterModel, setOpenRouterModel] = useState(
    DEFAULT_OPENROUTER_MODEL,
  );
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  
  const [openRouterModels, setOpenRouterModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Fetch all available models from OpenRouter's public API
  useEffect(() => {
    fetch("https://openrouter.ai/api/v1/models")
      .then((res) => res.json())
      .then((data: { data: { id: string; name: string }[] }) => {
        const ids = (data.data ?? []).map((m) => m.id).sort();
        setOpenRouterModels(ids.length > 0 ? ids : [DEFAULT_OPENROUTER_MODEL]);
      })
      .catch(() => {
        setOpenRouterModels([DEFAULT_OPENROUTER_MODEL]);
      })
      .finally(() => setModelsLoading(false));
  }, []);

  // Fetch saved settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings.get,
  });

  // Hydrate form from saved settings
  useEffect(() => {
    if (settings) {
      queueMicrotask(() => {
        setAwsAccessKeyId(settings.awsAccessKeyId || "");
        setAwsSecretAccessKey(settings.awsSecretAccessKey || "");
        setAwsRegion(settings.awsRegion || "us-east-1");
        setOpenRouterApiKey(settings.openRouterApiKey || "");
        setOpenRouterModel(
          settings.openRouterModel || DEFAULT_OPENROUTER_MODEL,
        );
        setTwilioAccountSid(settings.twilioAccountSid || "");
        setTwilioAuthToken(settings.twilioAuthToken || "");
        setTwilioPhoneNumber(settings.twilioPhoneNumber || "");
        setGeminiApiKey(settings.geminiApiKey || "");
      });
    }
  }, [settings]);

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: api.settings.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      showAlert("Your settings have been saved.", "success", "Settings saved");
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not save your settings. Please check the fields and try again.",
        "error",
      );
    },
  });

  const testSesMutation = useMutation({
    mutationFn: api.settings.testSes,
    onSuccess: (res) => {
      if (res.success) {
        showAlert(
          res.message || "Your email sending connection is working.",
          "success",
          "Email settings verified",
        );
      } else {
        showAlert(
          res.error ||
            "We could not verify your email sending settings. Please check your AWS details.",
          "error",
        );
      }
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not test your email sending settings. Please try again.",
        "error",
      );
    },
  });

  const testOpenRouterMutation = useMutation({
    mutationFn: api.settings.testOpenRouter,
    onSuccess: (res) => {
      if (res.success) {
        showAlert(
          res.message || "Your AI connection is working.",
          "success",
          "AI settings verified",
        );
      } else {
        showAlert(
          res.error ||
            "We could not verify your AI settings. Please check the API key.",
          "error",
        );
      }
    },
    onError: (err: Error) => {
      showAlert(
        err.message || "We could not test your AI settings. Please try again.",
        "error",
      );
    },
  });

  const testTwilioMutation = useMutation({
    mutationFn: api.settings.testTwilio,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (res.success) {
        showAlert(
          res.message || "Your Twilio integration is working.",
          "success",
          "Twilio settings verified",
        );
      } else {
        showAlert(
          res.error || "We could not verify your Twilio integration. Please check details.",
          "error",
        );
      }
    },
    onError: (err: Error) => {
      showAlert(err.message || "We could not test your Twilio settings. Please try again.", "error");
    },
  });

  const testGeminiMutation = useMutation({
    mutationFn: api.settings.testGemini,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (res.success) {
        showAlert(
          res.message || "Your Gemini API key is working.",
          "success",
          "Gemini settings verified",
        );
      } else {
        showAlert(
          res.error || "We could not verify your Gemini API key. Please check the API key.",
          "error",
        );
      }
    },
    onError: (err: Error) => {
      showAlert(err.message || "We could not test your Gemini settings. Please try again.", "error");
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
      twilioAccountSid,
      twilioAuthToken,
      twilioPhoneNumber,
      geminiApiKey,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/4 pb-4 border-b border-zinc-900" />
        <div className="h-96 bg-zinc-900 border border-zinc-850 rounded-2xl" />
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
          Configure API credentials and sender servers for AWS SES and
          OpenRouter AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AWS SES Panel */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/60">
            <Server className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              AWS Simple Email Service (SES)
            </h3>
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
            <h3 className="text-base font-bold text-white">
              OpenRouter AI Configuration
            </h3>
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
                Default LLM Model
              </label>
              <ModelCombobox
                models={openRouterModels}
                value={openRouterModel}
                onChange={setOpenRouterModel}
                isLoading={modelsLoading}
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

        {/* Twilio Panel */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Twilio Telephony Configuration</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                settings?.twilioStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                  : settings?.twilioStatus === 'FAILED'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                  : 'bg-zinc-850 text-zinc-400 border-zinc-800'
              }`}>
                {settings?.twilioStatus || 'DISCONNECTED'}
              </span>
              {settings?.twilioLastVerified && (
                <span className="text-[10px] text-zinc-500">
                  Verified: {new Date(settings.twilioLastVerified).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Twilio Account SID
              </label>
              <input
                type="text"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
                placeholder="AC..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Twilio Auth Token
              </label>
              <input
                type="password"
                value={twilioAuthToken}
                onChange={(e) => setTwilioAuthToken(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Twilio Phone Number
              </label>
              <input
                type="text"
                value={twilioPhoneNumber}
                onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-3">
            <button
              type="button"
              disabled={testTwilioMutation.isPending}
              onClick={() => testTwilioMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testTwilioMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Server className="h-3.5 w-3.5" />
              )}
              Test Twilio Connection
            </button>
          </div>
        </div>

        {/* Gemini Panel */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Google Gemini API Configuration</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                settings?.geminiStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                  : settings?.geminiStatus === 'FAILED'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                  : 'bg-zinc-850 text-zinc-400 border-zinc-800'
              }`}>
                {settings?.geminiStatus || 'DISCONNECTED'}
              </span>
              {settings?.geminiLastVerified && (
                <span className="text-[10px] text-zinc-500">
                  Verified: {new Date(settings.geminiLastVerified).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-3">
            <button
              type="button"
              disabled={testGeminiMutation.isPending}
              onClick={() => testGeminiMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testGeminiMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Key className="h-3.5 w-3.5" />
              )}
              Test Gemini Key
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
