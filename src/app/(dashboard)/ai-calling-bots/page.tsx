"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { api, LooseApiResponse } from "@/lib/api";
import { useOutreachStore } from "@/store/useOutreachStore";

type AiCallingBot = LooseApiResponse & {
  id: string;
  name?: string;
  description?: string;
  language?: string;
  voice?: string;
  role?: string;
  personality?: string;
  knowledge?: string;
  rules?: string;
  objectionHandling?: string;
  greeting?: string;
  ragEnabled?: boolean;
  status?: string;
  trainingChunkCount?: number;
  lastTrainedAt?: string;
  createdAt?: string;
};

type GoogleVoiceProfile = {
  id: string;
  label: string;
  language: string;
  voice: string;
  twilioFallbackVoice: string;
  accent: string;
  gender: "male" | "female";
};

type SearchResult = {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
};

type WorkspaceMode = "create" | "train" | "search";

const DEFAULT_FORM = {
  name: "",
  description: "",
  language: "en-IN",
  voice: "google:en-IN-Chirp3-HD-Puck",
  role: "calling specialist",
  personality: "warm, concise, calm, and naturally conversational",
  knowledge: "",
  rules:
    "Ask permission before continuing. Keep the call brief. Do not overpromise.",
  objectionHandling:
    "If the contact is busy, ask for a better callback time. If they are unsure, offer to send details.",
  greeting:
    "Hi {{firstName}}, this is {{botName}}. I know this is a quick call, so I will be brief.",
  ragEnabled: true,
};

const TRAINING_DEFAULTS = {
  sourceName: "manual-training",
  replace: true,
  chunkSize: 900,
  chunkOverlap: 120,
};

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none transition focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/40";
const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-zinc-500";
const panelClass =
  "rounded-2xl border border-zinc-850 bg-zinc-900/35 shadow-xl";

const formatDate = (value?: string) => {
  if (!value) return "Not trained";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not trained";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toNumberOrUndefined = (value: number) =>
  Number.isFinite(value) ? value : undefined;

export default function AiCallingBotsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();

  const [mode, setMode] = useState<WorkspaceMode>("create");
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [trainingText, setTrainingText] = useState("");
  const [trainingOptions, setTrainingOptions] = useState(TRAINING_DEFAULTS);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfSourceName, setPdfSourceName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const { data: bots = [], isLoading: isBotsLoading } = useQuery<
    AiCallingBot[]
  >({
    queryKey: ["ai-calling-bots"],
    queryFn: () => api.aiCallingBots.list() as Promise<AiCallingBot[]>,
  });

  const { data: voices = [] } = useQuery<GoogleVoiceProfile[]>({
    queryKey: ["ai-calling-bot-voices"],
    queryFn: () => api.aiCallingBots.voices() as Promise<GoogleVoiceProfile[]>,
  });

  const selectedBot = useMemo(
    () => bots.find((bot) => bot.id === selectedBotId) || bots[0] || null,
    [bots, selectedBotId],
  );

  const trainedCount = bots.filter(
    (bot) => Number(bot.trainingChunkCount || 0) > 0,
  ).length;
  const totalChunks = bots.reduce(
    (sum, bot) => sum + Number(bot.trainingChunkCount || 0),
    0,
  );

  const updateForm = (
    key: keyof typeof DEFAULT_FORM,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingBotId(null);
  };

  const selectBot = (bot: AiCallingBot) => {
    setSelectedBotId(bot.id);
    setMode("train");
  };

  const startEdit = (bot: AiCallingBot) => {
    setEditingBotId(bot.id);
    setSelectedBotId(bot.id);
    setForm({
      name: bot.name || "",
      description: bot.description || "",
      language: bot.language || "en-IN",
      voice: bot.voice || "google:en-IN-Chirp3-HD-Puck",
      role: bot.role || DEFAULT_FORM.role,
      personality: bot.personality || DEFAULT_FORM.personality,
      knowledge: bot.knowledge || "",
      rules: bot.rules || DEFAULT_FORM.rules,
      objectionHandling:
        bot.objectionHandling || DEFAULT_FORM.objectionHandling,
      greeting: bot.greeting || DEFAULT_FORM.greeting,
      ragEnabled: bot.ragEnabled !== false,
    });
    setMode("create");
  };

  const createBotMutation = useMutation({
    mutationFn: () => api.aiCallingBots.create(form),
    onSuccess: (bot: LooseApiResponse) => {
      queryClient.invalidateQueries({ queryKey: ["ai-calling-bots"] });
      setSelectedBotId(bot.id || null);
      resetForm();
      setMode("train");
      showAlert(
        "The AI calling bot is ready for training.",
        "success",
        "Bot created",
      );
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const updateBotMutation = useMutation({
    mutationFn: () => api.aiCallingBots.update(editingBotId!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-calling-bots"] });
      showAlert(
        "The AI calling bot profile was updated.",
        "success",
        "Bot updated",
      );
      resetForm();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const deleteBotMutation = useMutation({
    mutationFn: api.aiCallingBots.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-calling-bots"] });
      setSelectedBotId(null);
      setEditingBotId(null);
      setSearchResults([]);
      showAlert(
        "The bot and its embeddings were deleted.",
        "success",
        "Bot deleted",
      );
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const trainTextMutation = useMutation({
    mutationFn: () =>
      api.aiCallingBots.train(selectedBot!.id, {
        content: trainingText,
        sourceName: trainingOptions.sourceName,
        replace: trainingOptions.replace,
        chunkSize: toNumberOrUndefined(trainingOptions.chunkSize),
        chunkOverlap: toNumberOrUndefined(trainingOptions.chunkOverlap),
      }),
    onSuccess: (result: LooseApiResponse) => {
      queryClient.invalidateQueries({ queryKey: ["ai-calling-bots"] });
      setTrainingText("");
      showAlert(
        `Added ${result.chunksAdded || 0} chunk(s). Total chunks: ${result.totalChunks || 0}.`,
        "success",
        "Bot trained",
      );
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const trainPdfMutation = useMutation({
    mutationFn: () =>
      api.aiCallingBots.trainPdf(selectedBot!.id, {
        file: pdfFile!,
        sourceName: pdfSourceName || pdfFile?.name,
        replace: trainingOptions.replace,
        chunkSize: toNumberOrUndefined(trainingOptions.chunkSize),
        chunkOverlap: toNumberOrUndefined(trainingOptions.chunkOverlap),
      }),
    onSuccess: (result: LooseApiResponse) => {
      queryClient.invalidateQueries({ queryKey: ["ai-calling-bots"] });
      setPdfFile(null);
      setPdfSourceName("");
      showAlert(
        `Read ${result.characters || 0} characters from ${result.fileName || "PDF"}.`,
        "success",
        "PDF trained",
      );
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const searchMutation = useMutation({
    mutationFn: () =>
      api.aiCallingBots.search(selectedBot!.id, {
        query: searchQuery,
        topK: 4,
      }),
    onSuccess: (result: SearchResult[]) => setSearchResults(result || []),
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const submitBot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      showAlert("Bot name is required.", "error");
      return;
    }
    if (editingBotId) updateBotMutation.mutate();
    else createBotMutation.mutate();
  };

  const submitTextTraining = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBot) return showAlert("Select a bot first.", "error");
    if (!trainingText.trim())
      return showAlert("Training text is required.", "error");
    trainTextMutation.mutate();
  };

  const submitPdfTraining = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBot) return showAlert("Select a bot first.", "error");
    if (!pdfFile) return showAlert("Choose a PDF file first.", "error");
    trainPdfMutation.mutate();
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBot) return showAlert("Select a bot first.", "error");
    if (!searchQuery.trim())
      return showAlert("Enter a search question.", "error");
    searchMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-zinc-900 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
            <Bot className="h-8 w-8 text-indigo-400" />
            AI Calling Bots
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Build reusable calling agents, train their RAG knowledge, and test
            retrieval before campaigns use them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setMode("create");
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          New Bot
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Bot} label="Bots" value={bots.length} />
        <Metric icon={CheckCircle2} label="Trained" value={trainedCount} />
        <Metric icon={Database} label="Knowledge Chunks" value={totalChunks} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
        <section className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-zinc-850 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-white">Bot Library</p>
              <p className="text-xs text-zinc-500">
                Reusable AI calling profiles
              </p>
            </div>
            <RefreshCw className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="max-h-[720px] divide-y divide-zinc-850 overflow-y-auto">
            {isBotsLoading ? (
              [1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse bg-zinc-900/40" />
              ))
            ) : bots.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                No bots created yet.
              </div>
            ) : (
              bots.map((bot) => {
                const isActive = selectedBot?.id === bot.id;
                return (
                  <button
                    type="button"
                    key={bot.id}
                    onClick={() => selectBot(bot)}
                    className={`block w-full px-5 py-4 text-left transition ${
                      isActive ? "bg-indigo-950/25" : "hover:bg-zinc-900/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-100">
                          {bot.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                          {bot.description ||
                            bot.role ||
                            "AI calling specialist"}
                        </p>
                      </div>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-bold uppercase text-zinc-400">
                        {bot.language || "en-IN"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-zinc-500">
                      <span>{Number(bot.trainingChunkCount || 0)} chunks</span>
                      <span>{formatDate(bot.lastTrainedAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className={panelClass}>
          <div className="flex flex-col gap-3 border-b border-zinc-850 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                {mode === "create"
                  ? editingBotId
                    ? "Edit Bot"
                    : "Create Bot"
                  : selectedBot?.name || "Select Bot"}
              </p>
              <p className="text-xs text-zinc-500">
                {mode === "create"
                  ? "Configure voice, persona, and guardrails."
                  : "Train and inspect bot knowledge."}
              </p>
            </div>
            <div className="flex w-full gap-2 rounded-xl border border-zinc-850 bg-zinc-950/80 p-1 lg:w-auto">
              <ModeButton
                active={mode === "create"}
                icon={Settings2}
                label="Profile"
                onClick={() => setMode("create")}
              />
              <ModeButton
                active={mode === "train"}
                icon={Upload}
                label="Train"
                onClick={() => setMode("train")}
              />
              <ModeButton
                active={mode === "search"}
                icon={Search}
                label="Search"
                onClick={() => setMode("search")}
              />
            </div>
          </div>

          <div className="p-5">
            {mode === "create" ? (
              <form onSubmit={submitBot} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Bot Name">
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Reach Agent"
                    />
                  </Field>
                  <Field label="Role">
                    <input
                      className={inputClass}
                      value={form.role}
                      onChange={(e) => updateForm("role", e.target.value)}
                    />
                  </Field>
                  <Field label="Language">
                    <select
                      className={inputClass}
                      value={form.language}
                      onChange={(e) => updateForm("language", e.target.value)}
                    >
                      {(voices.length ? voices : FALLBACK_VOICES).map(
                        (voice) => (
                          <option key={voice.id} value={voice.language}>
                            {voice.label}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                  <Field label="Google Voice">
                    <select
                      className={inputClass}
                      value={form.voice}
                      onChange={(e) => updateForm("voice", e.target.value)}
                    >
                      {(voices.length ? voices : FALLBACK_VOICES).map(
                        (voice) => (
                          <option key={voice.voice} value={voice.voice}>
                            {voice.label} · {voice.voice.replace("google:", "")}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                </div>

                <Field label="Description">
                  <input
                    className={inputClass}
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Outbound sales qualification bot"
                  />
                </Field>
                <Field label="Personality">
                  <textarea
                    className={`${inputClass} min-h-20`}
                    value={form.personality}
                    onChange={(e) => updateForm("personality", e.target.value)}
                  />
                </Field>
                <Field label="Base Knowledge">
                  <textarea
                    className={`${inputClass} min-h-28`}
                    value={form.knowledge}
                    onChange={(e) => updateForm("knowledge", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Rules">
                    <textarea
                      className={`${inputClass} min-h-28`}
                      value={form.rules}
                      onChange={(e) => updateForm("rules", e.target.value)}
                    />
                  </Field>
                  <Field label="Objection Handling">
                    <textarea
                      className={`${inputClass} min-h-28`}
                      value={form.objectionHandling}
                      onChange={(e) =>
                        updateForm("objectionHandling", e.target.value)
                      }
                    />
                  </Field>
                </div>
                <Field label="Greeting">
                  <input
                    className={inputClass}
                    value={form.greeting}
                    onChange={(e) => updateForm("greeting", e.target.value)}
                  />
                </Field>
                <label className="flex items-center gap-3 rounded-xl border border-zinc-850 bg-zinc-950 px-3 py-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={form.ragEnabled}
                    onChange={(e) => updateForm("ragEnabled", e.target.checked)}
                    className="h-4 w-4 accent-indigo-500"
                  />
                  RAG knowledge enabled
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={
                      createBotMutation.isPending || updateBotMutation.isPending
                    }
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {createBotMutation.isPending ||
                    updateBotMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editingBotId ? "Save Changes" : "Create Bot"}
                  </button>
                  {editingBotId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : mode === "train" ? (
              <div className="space-y-5">
                <SelectedBotHeader
                  bot={selectedBot}
                  onEdit={() => selectedBot && startEdit(selectedBot)}
                  onDelete={() =>
                    selectedBot && deleteBotMutation.mutate(selectedBot.id)
                  }
                  deleting={deleteBotMutation.isPending}
                />
                <TrainingOptions
                  options={trainingOptions}
                  setOptions={setTrainingOptions}
                />
                <div className="grid gap-5 lg:grid-cols-2">
                  <form
                    onSubmit={submitTextTraining}
                    className="rounded-2xl border border-zinc-850 bg-zinc-950/50 p-4"
                  >
                    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                      <FileText className="h-4 w-4 text-indigo-400" /> Text
                      Training
                    </div>
                    <Field label="Source Name">
                      <input
                        className={inputClass}
                        value={trainingOptions.sourceName}
                        onChange={(e) =>
                          setTrainingOptions((current) => ({
                            ...current,
                            sourceName: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Training Content">
                      <textarea
                        className={`${inputClass} mt-3 min-h-56`}
                        value={trainingText}
                        onChange={(e) => setTrainingText(e.target.value)}
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={!selectedBot || trainTextMutation.isPending}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {trainTextMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4" />
                      )}
                      Train Text
                    </button>
                  </form>

                  <form
                    onSubmit={submitPdfTraining}
                    className="rounded-2xl border border-zinc-850 bg-zinc-950/50 p-4"
                  >
                    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                      <Upload className="h-4 w-4 text-indigo-400" /> PDF
                      Training
                    </div>
                    <Field label="PDF File">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) =>
                          setPdfFile(e.target.files?.[0] || null)
                        }
                        className="w-full rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-3 py-6 text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-xs file:font-bold file:text-zinc-200"
                      />
                    </Field>
                    <Field label="Source Name">
                      <input
                        className={`${inputClass} mt-3`}
                        value={pdfSourceName}
                        onChange={(e) => setPdfSourceName(e.target.value)}
                        placeholder={pdfFile?.name || "Uses PDF filename"}
                      />
                    </Field>
                    <div className="mt-4 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3 text-xs text-zinc-500">
                      {pdfFile
                        ? `${pdfFile.name} · ${(pdfFile.size / 1024 / 1024).toFixed(2)} MB`
                        : "PDFs up to 8 MB are parsed in memory."}
                    </div>
                    <button
                      type="submit"
                      disabled={
                        !selectedBot || !pdfFile || trainPdfMutation.isPending
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {trainPdfMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Train PDF
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <SelectedBotHeader
                  bot={selectedBot}
                  onEdit={() => selectedBot && startEdit(selectedBot)}
                  onDelete={() =>
                    selectedBot && deleteBotMutation.mutate(selectedBot.id)
                  }
                  deleting={deleteBotMutation.isPending}
                />
                <form
                  onSubmit={submitSearch}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-850 bg-zinc-950/50 p-4 md:flex-row"
                >
                  <input
                    className={inputClass}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask something this bot should know"
                  />
                  <button
                    type="submit"
                    disabled={!selectedBot || searchMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {searchMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </button>
                </form>
                <div className="space-y-3">
                  {searchResults.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-850 bg-zinc-950/40 p-8 text-center text-sm text-zinc-500">
                      No search results yet.
                    </div>
                  ) : (
                    searchResults.map((result, index) => (
                      <div
                        key={result.id || index}
                        className="rounded-2xl border border-zinc-850 bg-zinc-950/50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-500">
                          <span className="font-bold text-zinc-300">
                            Result {index + 1}
                          </span>
                          <span>{Math.round((result.score || 0) * 100)}%</span>
                        </div>
                        <p className="text-sm leading-6 text-zinc-300">
                          {result.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const FALLBACK_VOICES: GoogleVoiceProfile[] = [
  {
    id: "indian_english",
    label: "Indian English",
    language: "en-IN",
    voice: "google:en-IN-Chirp3-HD-Puck",
    twilioFallbackVoice: "Google.en-IN-Wavenet-D",
    accent: "Indian Accent",
    gender: "male",
  },
  {
    id: "hindi",
    label: "Hindi",
    language: "hi-IN",
    voice: "google:hi-IN-Chirp3-HD-Puck",
    twilioFallbackVoice: "Google.hi-IN-Neural2-C",
    accent: "Indian Accent",
    gender: "male",
  },
  {
    id: "english",
    label: "English",
    language: "en-US",
    voice: "google:en-US-Chirp3-HD-Puck",
    twilioFallbackVoice: "Google.en-US-Neural2-D",
    accent: "American Accent",
    gender: "male",
  },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bot;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-850 bg-zinc-900/35 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Bot;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition lg:flex-none ${active ? "border border-zinc-700 bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-200"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function SelectedBotHeader({
  bot,
  onEdit,
  onDelete,
  deleting,
}: {
  bot: AiCallingBot | null;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  if (!bot) {
    return (
      <div className="rounded-2xl border border-zinc-850 bg-zinc-950/50 p-5 text-sm text-zinc-500">
        Select or create a bot to continue.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-850 bg-zinc-950/50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-black text-white">{bot.name}</p>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase text-zinc-400">
              {bot.status || "READY"}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {bot.description || bot.role || "AI calling specialist"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
            <span className="rounded-lg border border-zinc-850 px-2 py-1">
              {bot.language || "en-IN"}
            </span>
            <span className="rounded-lg border border-zinc-850 px-2 py-1">
              {Number(bot.trainingChunkCount || 0)} chunks
            </span>
            <span className="rounded-lg border border-zinc-850 px-2 py-1">
              {formatDate(bot.lastTrainedAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-rose-900/60 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-950/30 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function TrainingOptions({
  options,
  setOptions,
}: {
  options: typeof TRAINING_DEFAULTS;
  setOptions: React.Dispatch<React.SetStateAction<typeof TRAINING_DEFAULTS>>;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-zinc-850 bg-zinc-950/50 p-4 sm:grid-cols-3">
      <label className="flex items-center gap-3 rounded-xl border border-zinc-850 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={options.replace}
          onChange={(e) =>
            setOptions((current) => ({ ...current, replace: e.target.checked }))
          }
          className="h-4 w-4 accent-indigo-500"
        />
        Replace existing knowledge
      </label>
      <Field label="Chunk Size">
        <input
          type="number"
          min={300}
          max={1600}
          className={inputClass}
          value={options.chunkSize}
          onChange={(e) =>
            setOptions((current) => ({
              ...current,
              chunkSize: Number(e.target.value),
            }))
          }
        />
      </Field>
      <Field label="Overlap">
        <input
          type="number"
          min={0}
          max={400}
          className={inputClass}
          value={options.chunkOverlap}
          onChange={(e) =>
            setOptions((current) => ({
              ...current,
              chunkOverlap: Number(e.target.value),
            }))
          }
        />
      </Field>
    </div>
  );
}
