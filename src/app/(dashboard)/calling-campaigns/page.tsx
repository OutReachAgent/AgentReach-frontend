"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LooseApiResponse } from "@/lib/api";
import {
  HD_VOICE_GENDER,
  getHdVoices,
  vertexLanguageLabels,
} from "@/lib/utils";
import { useOutreachStore } from "@/store/useOutreachStore";
import { useEffect, useRef, useState, useMemo } from "react";
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
  CheckSquare,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Square,
  Folder,
  Languages,
  Headphones,
  Bot,
  Sparkles,
} from "lucide-react";
import { MissingCredentials } from "@/components/MissingCredentials";

type DirectoryFilter = "all" | "uncategorized" | string;

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  directoryId?: string | null;
};

type ContactDirectory = {
  id: string;
  name: string;
  contactCount?: number;
};

type AiCallingBot = {
  id: string;
  name?: string;
  description?: string;
  language?: string;
  voice?: string;
  role?: string;
  personality?: string;
  ragEnabled?: boolean;
  trainingChunkCount?: number;
  lastTrainedAt?: string;
};

type GeneratedCallingCampaign = {
  name: string;
  objective: string;
  prompt: string;
  voice: string;
  language: string;
};

type CallingCampaignGenerationJob = {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  result?: GeneratedCallingCampaign;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

type VoiceGender = "female" | "male";

const VOICE_OPTIONS: {
  value: string;
  label: string;
  language: string;
  gender: VoiceGender;
}[] = [
  {
    value: "Zephyr",
    label: "Zephyr - Bright",
    language: "en",
    gender: "female",
  },
  { value: "Puck", label: "Puck - Upbeat", language: "en", gender: "male" },
  {
    value: "Charon",
    label: "Charon - Informative",
    language: "en",
    gender: "male",
  },
  { value: "Kore", label: "Kore - Firm", language: "en-IN", gender: "female" },
  {
    value: "Fenrir",
    label: "Fenrir - Excitable",
    language: "en",
    gender: "male",
  },
  { value: "Leda", label: "Leda - Youthful", language: "en", gender: "female" },
  { value: "Orus", label: "Orus - Firm", language: "en-IN", gender: "male" },
  { value: "Aoede", label: "Aoede - Breezy", language: "en", gender: "female" },
  {
    value: "Callirrhoe",
    label: "Callirrhoe - Easy-going",
    language: "en",
    gender: "female",
  },
  {
    value: "Autonoe",
    label: "Autonoe - Bright",
    language: "en-IN",
    gender: "female",
  },
  {
    value: "Enceladus",
    label: "Enceladus - Breathy",
    language: "en",
    gender: "male",
  },
  {
    value: "Iapetus",
    label: "Iapetus - Clear",
    language: "en-IN",
    gender: "male",
  },
  {
    value: "Umbriel",
    label: "Umbriel - Easy-going",
    language: "en",
    gender: "male",
  },
  {
    value: "Algieba",
    label: "Algieba - Smooth",
    language: "en",
    gender: "male",
  },
  {
    value: "Despina",
    label: "Despina - Smooth",
    language: "en-IN",
    gender: "female",
  },
  {
    value: "Erinome",
    label: "Erinome - Clear",
    language: "en",
    gender: "female",
  },
  {
    value: "Algenib",
    label: "Algenib - Gravelly",
    language: "en",
    gender: "male",
  },
  {
    value: "Rasalgethi",
    label: "Rasalgethi - Informative",
    language: "en-IN",
    gender: "male",
  },
  {
    value: "Laomedeia",
    label: "Laomedeia - Upbeat",
    language: "en",
    gender: "female",
  },
  {
    value: "Achernar",
    label: "Achernar - Soft",
    language: "en-IN",
    gender: "female",
  },
  { value: "Alnilam", label: "Alnilam - Firm", language: "en", gender: "male" },
  { value: "Schedar", label: "Schedar - Even", language: "en", gender: "male" },
  {
    value: "Gacrux",
    label: "Gacrux - Mature",
    language: "en-IN",
    gender: "female",
  },
  {
    value: "Pulcherrima",
    label: "Pulcherrima - Forward",
    language: "en",
    gender: "female",
  },
  {
    value: "Achird",
    label: "Achird - Friendly",
    language: "en-IN",
    gender: "male",
  },
  {
    value: "Zubenelgenubi",
    label: "Zubenelgenubi - Casual",
    language: "en",
    gender: "male",
  },
  {
    value: "Vindemiatrix",
    label: "Vindemiatrix - Gentle",
    language: "en-IN",
    gender: "female",
  },
  {
    value: "Sadachbia",
    label: "Sadachbia - Lively",
    language: "en",
    gender: "female",
  },
  {
    value: "Sadaltager",
    label: "Sadaltager - Knowledgeable",
    language: "en",
    gender: "male",
  },
  {
    value: "Sulafat",
    label: "Sulafat - Warm",
    language: "en-IN",
    gender: "female",
  },
  {
    value: "Aditi_hi",
    label: "Aditi - Standard (Hindi)",
    language: "hi",
    gender: "female",
  },
  {
    value: "Kajal_hi",
    label: "Kajal - Natural (Hindi)",
    language: "hi",
    gender: "female",
  },
  {
    value: "Madhav_hi",
    label: "Madhav - Clear (Hindi)",
    language: "hi",
    gender: "male",
  },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "en-IN", label: "English (India)" },
  { value: "cmn", label: "Chinese, Mandarin" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" },
  { value: "bn", label: "Bangla" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "id", label: "Indonesian" },
  { value: "ur", label: "Urdu" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "pa", label: "Punjabi" },
  { value: "mr", label: "Marathi" },
  { value: "te", label: "Telugu" },
  { value: "tr", label: "Turkish" },
  { value: "ta", label: "Tamil" },
  { value: "vi", label: "Vietnamese" },
  { value: "ko", label: "Korean" },
  { value: "it", label: "Italian" },
  { value: "fil", label: "Filipino" },
  { value: "gu", label: "Gujarati" },
  { value: "fa", label: "Persian" },
  { value: "pl", label: "Polish" },
  { value: "uk", label: "Ukrainian" },
  { value: "nl", label: "Dutch" },
  { value: "ms", label: "Malay" },
  { value: "ro", label: "Romanian" },
  { value: "el", label: "Greek" },
  { value: "hu", label: "Hungarian" },
  { value: "he", label: "Hebrew" },
  { value: "th", label: "Thai" },
  { value: "sv", label: "Swedish" },
  { value: "cs", label: "Czech" },
  { value: "da", label: "Danish" },
  { value: "fi", label: "Finnish" },
  { value: "nb", label: "Norwegian, Bokmal" },
  { value: "sr", label: "Serbian" },
  { value: "sk", label: "Slovak" },
  { value: "bg", label: "Bulgarian" },
  { value: "hr", label: "Croatian" },
  { value: "sl", label: "Slovenian" },
  { value: "sw", label: "Swahili" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "ne", label: "Nepali" },
  { value: "my", label: "Burmese" },
  { value: "si", label: "Sinhala" },
  { value: "af", label: "Afrikaans" },
];

const normalizeVoiceValue = (value?: string) =>
  VOICE_OPTIONS.some((option) => option.value === value)
    ? value || "Kore"
    : "Kore";

const normalizeLanguageValue = (value?: string) => {
  if (!value) return "en";
  if (value === "English") return "en";
  if (value === "Indian English") return "en-IN";
  if (value === "Hindi") return "hi";
  if (value === "Marathi") return "mr";
  return LANGUAGE_OPTIONS.some((option) => option.value === value)
    ? value
    : "en";
};

const getVoiceLabel = (value: string) =>
  VOICE_OPTIONS.find((option) => option.value === value)?.label || value;

const getLanguageLabel = (value: string) =>
  LANGUAGE_OPTIONS.find((option) => option.value === value)?.label || value;

const getVoiceDefaultLanguage = (value: string) =>
  VOICE_OPTIONS.find((option) => option.value === value)?.language || "en";

const getVoiceDefaultGender = (value: string): VoiceGender =>
  VOICE_OPTIONS.find((option) => option.value === value)?.gender || "female";

const getVoicesForLanguage = (value: string) =>
  VOICE_OPTIONS.filter((option) => option.language === value);

const getVoicesForLanguageAndGender = (
  languageValue: string,
  genderValue: VoiceGender,
) =>
  VOICE_OPTIONS.filter(
    (option) =>
      option.language === languageValue && option.gender === genderValue,
  );

const VOICE_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS.filter((languageOption) =>
  VOICE_OPTIONS.some(
    (voiceOption) => voiceOption.language === languageOption.value,
  ),
);

const LANGUAGE_PREVIEW_TEXTS: Record<string, string> = {
  "en-IN": "Hello, this is a quick ReachConvert voice preview.",
  "hi-IN": "नमस्ते, यह एक त्वरित रीचकन्वर्ट वॉयस प्रीव्यू है।",
  "bn-IN": "নমস্কার, এটি একটি দ্রুত রিচকনভার্ট ভয়েস প্রিভিউ।",
  "gu-IN": "નમસ્તે, આ એક ઝડપી રીચકન્વર્ટ વોઇસ પ્રીવ્યૂ છે.",
  "mr-IN": "नमस्कार, हा एक द्रुत रीचकन्व्हर्ट व्हॉइस प्रिव्ह्यू आहे.",
  "ta-IN": "வணக்கம், இது ஒரு விரைவான ரீச்கன்வெர்ட் குரல் முன்னோட்டம்.",
  "te-IN": "నమస్కారం, ఇది శీఘ్ర రీచ్‌కన్వర్ట్ వాయిస్ ప్రివ్యూ.",
  "kn-IN": "ನಮಸ್ಕಾರ, ಇದು ತ್ವರಿತ ರೀಚ್‌ಕನ್ವರ್ಟ್ ಧ್ವನಿ ಪೂರ್ವವೀಕ್ಷಣೆ.",
  "ml-IN": "നമസ്കാരം, ഇതൊരു ദ്രുത റീച്ച്കൺവെർട്ട് വോയ്‌സ് പ്രിവ്യൂ ആണ്.",
  "pa-IN": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਇਹ ਇੱਕ ਤੇਜ਼ ਰੀਚਕਨਵਰਟ ਵੌਇਸ ਪ੍ਰੀਵਿਊ ਹੈ।",
};

const normalizeCampaignLanguage = (
  voiceValue?: string,
  languageValue?: string,
) => {
  const normalizedLanguage = languageValue
    ? normalizeLanguageValue(languageValue)
    : "";
  return getVoicesForLanguage(normalizedLanguage).length
    ? normalizedLanguage
    : getVoiceDefaultLanguage(normalizeVoiceValue(voiceValue));
};

const normalizeVoiceForLanguageAndGender = (
  voiceValue: string | undefined,
  languageValue: string,
  genderValue: VoiceGender,
) => {
  const normalizedVoice = normalizeVoiceValue(voiceValue);
  const languageVoices = getVoicesForLanguageAndGender(
    languageValue,
    genderValue,
  );
  return languageVoices.some((option) => option.value === normalizedVoice)
    ? normalizedVoice
    : languageVoices[0]?.value || normalizedVoice;
};

const extractHdVoiceName = (value?: string) => {
  const rawValue = value?.trim();
  if (!rawValue) return "";
  const withoutProvider = rawValue.replace(/^google:/i, "");
  const matched = withoutProvider.match(
    /^[a-z]{2,3}-[A-Z]{2}-Chirp3-HD-([A-Za-z]+)$/,
  );
  return matched?.[1] || withoutProvider;
};

const extractHdLanguage = (value?: string) => {
  const rawValue = value?.trim().replace(/^google:/i, "");
  return (
    rawValue?.match(/^([a-z]{2,3}-[A-Z]{2})-Chirp3-HD-[A-Za-z]+$/)?.[1] ||
    ""
  );
};

const getHdVoiceDefaultGender = (value?: string): VoiceGender => {
  const voiceName = extractHdVoiceName(value);
  return HD_VOICE_GENDER[voiceName] || "female";
};

const normalizeHdLanguageValue = (
  languageValue?: string,
  voiceValue?: string,
) => {
  if (languageValue && getHdVoices(languageValue).length > 0) {
    return languageValue;
  }
  const languageFromVoice = extractHdLanguage(voiceValue);
  if (languageFromVoice && getHdVoices(languageFromVoice).length > 0) {
    return languageFromVoice;
  }
  return "en-IN";
};

const normalizeHdVoiceForLanguageAndGender = (
  voiceValue: string | undefined,
  languageValue: string,
  genderValue: VoiceGender,
) => {
  const voiceName = extractHdVoiceName(voiceValue);
  const voices = getHdVoices(languageValue, genderValue);
  if (voices.some((option) => option.value === voiceName)) {
    return voiceName;
  }
  return voices[0]?.value || getHdVoices(languageValue)[0]?.value || "Puck";
};

const buildGoogleHdVoice = (voiceName: string, languageValue: string) =>
  `google:${languageValue}-Chirp3-HD-${extractHdVoiceName(voiceName) || "Puck"}`;

const antigravityLanguages = vertexLanguageLabels.filter(
  (group) =>
    group.label === "Indian Languages" || group.label === "European Languages",
);

function HDVoiceSelector({
  value,
  onChange,
  language,
  gender,
  previewText,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
  gender: VoiceGender;
  previewText: string;
}) {
  const [open, setOpen] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const togglePlay = async (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    const voiceName = `google:${language}-Chirp3-HD-${val}`;
    if (previewingVoice === voiceName) {
      audioRef.current?.pause();
      setPreviewingVoice(null);
    } else {
      setPreviewingVoice(voiceName);
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const result = await api.settings.previewGeminiVoice({
          voice: voiceName,
          language,
          text: previewText,
        });
        const audio = new Audio(result.audioDataUrl);
        audioRef.current = audio;
        audio.onended = () => {
          setPreviewingVoice(null);
        };
        audio.play().catch(() => {
          setPreviewingVoice(null);
        });
      } catch {
        setPreviewingVoice(null);
      }
    }
  };

  const voices = useMemo(
    () => getHdVoices(language, gender),
    [language, gender],
  );

  const selectedLabel = useMemo(() => {
    const found = voices.find((v) => v.value === value);
    return found ? found.label : "Select HD Voice";
  }, [value, voices]);

  // Effect to auto-select a valid voice if current is not in filtered list
  useEffect(() => {
    if (voices.length > 0 && !voices.some((v) => v.value === value)) {
      onChange(voices[0].value);
    }
  }, [voices, value, onChange]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-left text-xs text-zinc-200 transition-colors hover:border-zinc-700 focus:border-indigo-500/50 focus:outline-none"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-zinc-950 scrollbar-thumb-zinc-800">
          {voices.length > 0 ? (
            <ul>
              {voices.map((opt) => (
                <li key={opt.value}>
                  <div
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-900 ${opt.value === value ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-300"}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        if (audioRef.current) audioRef.current.pause();
                        setPreviewingVoice(null);
                      }}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      {opt.value === value && (
                        <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className={opt.value === value ? "" : "pl-5.5"}>
                        {opt.label}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => togglePlay(e, opt.value)}
                      className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      {previewingVoice === `google:${language}-Chirp3-HD-${opt.value}` ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-xs text-zinc-500 text-center">
              No {gender} HD voices available for this language.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CallingCampaignsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();
  const isCampaignActive = (status?: string) =>
    status === "RUNNING" || status === "LAUNCHING";

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings.get,
  });

  const [activeTab, setActiveTab] = useState<"list" | "detail" | "create">(
    "list",
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(
    null,
  );

  // Audio Player Simulation
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  // Expanded Transcript Collapsible
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  // Create Campaign State
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aiCampaignPrompt, setAiCampaignPrompt] = useState("");
  const [aiCampaignTone, setAiCampaignTone] = useState(
    "Warm, natural, concise, and helpful",
  );
  const [voiceQuality, setVoiceQuality] = useState<"generic" | "hd">("generic");
  const [voice, setVoice] = useState("Kore");
  const [language, setLanguage] = useState("en-IN");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [voicePreviewUrl, setVoicePreviewUrl] = useState("");
  const [voicePreviewText, setVoicePreviewText] = useState(
    "Hello, this is a quick ReachConvert voice preview.",
  );
  const [aiCallingBotId, setAiCallingBotId] = useState<string | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContactDirectoryId, setSelectedContactDirectoryId] =
    useState<DirectoryFilter>("all");
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const handledGenerationJobIdRef = useRef<string | null>(null);
  const [isAddContactsOpen, setIsAddContactsOpen] = useState(false);
  const [addContactSearch, setAddContactSearch] = useState("");
  const [addContactsDirectoryId, setAddContactsDirectoryId] =
    useState<DirectoryFilter>("all");
  const [addSelectedContactIds, setAddSelectedContactIds] = useState<string[]>(
    [],
  );

  // Fetch campaigns list
  const { data: campaigns = [], isLoading: isListLoading } = useQuery({
    queryKey: ["calling-campaigns"],
    queryFn: api.callingCampaigns.list,
  });

  // Fetch AI calling bots for bot picker
  const { data: aiBots = [] } = useQuery<AiCallingBot[]>({
    queryKey: ["ai-calling-bots"],
    queryFn: () => api.aiCallingBots.list() as Promise<AiCallingBot[]>,
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.list() as Promise<Contact[]>,
  });

  const { data: contactDirectories = [] } = useQuery<ContactDirectory[]>({
    queryKey: ["contact-directories"],
    queryFn: () =>
      api.contacts.directories.list() as Promise<ContactDirectory[]>,
  });

  // Fetch single campaign details
  const { data: campaignDetails, isLoading: isDetailLoading } = useQuery({
    queryKey: ["calling-campaign", selectedCampaignId],
    queryFn: () =>
      selectedCampaignId ? api.callingCampaigns.get(selectedCampaignId) : null,
    enabled: !!selectedCampaignId,
    refetchInterval: (query) => {
      // Fast refetch when simulation is running to show real-time call updates!
      return isCampaignActive(query.state.data?.status) ? 2000 : false;
    },
  });

  const { data: generationJob } = useQuery<CallingCampaignGenerationJob>({
    queryKey: ["calling-campaign-generation-job", generationJobId],
    queryFn: () =>
      api.callingCampaigns.generationStatus(
        generationJobId!,
      ) as Promise<CallingCampaignGenerationJob>,
    enabled: !!generationJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : 3000;
    },
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: api.callingCampaigns.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      showAlert(
        "Your calling campaign is saved and ready.",
        "success",
        "Campaign ready",
      );
      resetForm();
      setActiveTab("list");
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not save this calling campaign. Please check the details and try again.",
        "error",
      );
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LooseApiResponse }) =>
      api.callingCampaigns.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      if (editingCampaignId) {
        queryClient.invalidateQueries({
          queryKey: ["calling-campaign", editingCampaignId],
        });
      }
      showAlert(
        "The calling campaign has been updated.",
        "success",
        "Campaign updated",
      );
      resetForm();
      setEditingCampaignId(null);
      setActiveTab(selectedCampaignId ? "detail" : "list");
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not update this calling campaign. Please try again.",
        "error",
      );
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: api.callingCampaigns.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["history-calls"] });
      showAlert(
        "The calling campaign and its call logs were deleted.",
        "success",
        "Campaign deleted",
      );
      setSelectedCampaignId(null);
      setEditingCampaignId(null);
      setActiveTab("list");
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not delete this calling campaign. Please try again.",
        "error",
      );
    },
  });

  const launchCampaignMutation = useMutation({
    mutationFn: ({
      id,
      isRelaunch,
    }: {
      id: string;
      isRelaunch: boolean;
    }) =>
      isRelaunch
        ? api.callingCampaigns.relaunch(id)
        : api.callingCampaigns.launch(id),
    onSuccess: (
      result: LooseApiResponse,
      variables: { id: string; isRelaunch: boolean },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      if (selectedCampaignId) {
        queryClient.invalidateQueries({
          queryKey: ["calling-campaign", selectedCampaignId],
        });
      }
      const twilio = result?.twilio;
      if (
        twilio &&
        Number(twilio.placed || 0) === 0 &&
        Number(twilio.failed || 0) > 0
      ) {
        showAlert(
          twilio.errors?.[0] ||
            "Twilio did not queue any calls. Check Twilio settings and PUBLIC_API_URL.",
          "error",
          "Calling not queued",
        );
        return;
      }
      showAlert(
        twilio
          ? `Twilio queued ${twilio.placed || 0} call(s). Failed: ${twilio.failed || 0}.`
          : variables.isRelaunch
            ? "The calling campaign has been relaunched. Twilio queue status will appear in the call logs."
            : "The calling campaign has started. Twilio queue status will appear in the call logs.",
        "success",
        variables.isRelaunch ? "Calling relaunched" : "Calling started",
      );
    },
    onError: (err: Error, variables: { id: string; isRelaunch: boolean }) => {
      showAlert(
        err.message ||
          (variables.isRelaunch
            ? "We could not relaunch the calling campaign. Please try again."
            : "We could not start the calling campaign. Please add contacts first."),
        "error",
      );
    },
  });

  const stopCampaignMutation = useMutation({
    mutationFn: api.callingCampaigns.stop,
    onSuccess: (result: LooseApiResponse) => {
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      if (selectedCampaignId) {
        queryClient.invalidateQueries({
          queryKey: ["calling-campaign", selectedCampaignId],
        });
      }
      const cancelledCount = Number(result?.cancelledCalls || 0);
      showAlert(
        `The campaign was stopped. ${cancelledCount} call(s) were cancelled.`,
        "success",
        "Campaign stopped",
      );
    },
    onError: (err: Error) => {
      showAlert(
        err.message || "We could not stop this calling campaign.",
        "error",
      );
    },
  });

  const addContactsMutation = useMutation({
    mutationFn: ({ id, contactIds }: { id: string; contactIds: string[] }) =>
      api.callingCampaigns.update(id, { contactIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      if (selectedCampaignId) {
        queryClient.invalidateQueries({
          queryKey: ["calling-campaign", selectedCampaignId],
        });
      }
      setIsAddContactsOpen(false);
      setAddContactSearch("");
      setAddContactsDirectoryId("all");
      setAddSelectedContactIds([]);
      showAlert(
        "The selected contacts were added to this calling campaign.",
        "success",
        "Contacts added",
      );
    },
    onError: (err: Error) => {
      showAlert(
        err.message || "We could not add those contacts. Please try again.",
        "error",
      );
    },
  });

  const previewVoiceMutation = useMutation({
    mutationFn: () =>
      api.settings.previewGeminiVoice({
        voice:
          voiceQuality === "hd"
            ? buildGoogleHdVoice(
                normalizeHdVoiceForLanguageAndGender(
                  voice,
                  normalizeHdLanguageValue(language, voice),
                  voiceGender,
                ),
                normalizeHdLanguageValue(language, voice),
              )
            : voice,
        language:
          voiceQuality === "hd"
            ? normalizeHdLanguageValue(language, voice)
            : language,
        text: voicePreviewText,
      }),
    onSuccess: (res) => {
      setVoicePreviewUrl(res.audioDataUrl || "");
      showAlert("Voice preview is ready.", "success", "Preview ready");
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not generate a voice preview. Please check your Google credential settings.",
        "error",
      );
    },
  });

  const generateCallingCampaignMutation = useMutation<
    CallingCampaignGenerationJob,
    Error
  >({
    mutationFn: () =>
      api.callingCampaigns.startGenerate({
        prompt: aiCampaignPrompt,
        tone: aiCampaignTone,
      }) as Promise<CallingCampaignGenerationJob>,
    onSuccess: (job) => {
      setGenerationJobId(job.id);
      handledGenerationJobIdRef.current = null;
      showAlert(
        "AI calling campaign generation started. Status will refresh automatically.",
        "info",
        "Generating campaign",
      );
    },
    onError: (err: Error) => {
      showAlert(
        err.message ||
          "We could not generate a calling campaign. Please try a more specific prompt.",
        "error",
      );
    },
  });

  useEffect(() => {
    if (
      !generationJob ||
      !generationJobId ||
      handledGenerationJobIdRef.current === generationJobId
    )
      return;

    if (generationJob.status === "COMPLETED" && generationJob.result) {
      const generated = generationJob.result;
      handledGenerationJobIdRef.current = generationJobId;
      window.setTimeout(() => {
        const nextLanguage = normalizeHdLanguageValue(
          generated.language,
          generated.voice,
        );
        const nextGender = getHdVoiceDefaultGender(generated.voice);
        const nextVoice = normalizeHdVoiceForLanguageAndGender(
          generated.voice,
          nextLanguage,
          nextGender,
        );
        setName((current) => generated.name || current);
        setObjective(generated.objective || "");
        setPrompt(generated.prompt || aiCampaignPrompt);
        setVoiceQuality("hd");
        setVoiceGender(nextGender);
        setVoice(nextVoice);
        setLanguage(nextLanguage);
        setVoicePreviewText(
          LANGUAGE_PREVIEW_TEXTS[nextLanguage] || LANGUAGE_PREVIEW_TEXTS["en-IN"],
        );
        setVoicePreviewUrl("");
        setGenerationJobId(null);
        showAlert(
          "AI calling campaign draft generated.",
          "success",
          "Campaign generated",
        );
      }, 0);
    }

    if (generationJob.status === "FAILED") {
      handledGenerationJobIdRef.current = generationJobId;
      window.setTimeout(() => {
        setGenerationJobId(null);
        showAlert(
          generationJob.error ||
            "We could not generate a calling campaign. Please try a more specific prompt.",
          "error",
        );
      }, 0);
    }
  }, [aiCampaignPrompt, generationJob, generationJobId, showAlert]);

  const resetForm = () => {
    setName("");
    setObjective("");
    setPrompt("");
    setAiCampaignPrompt("");
    setAiCampaignTone("Warm, natural, concise, and helpful");
    setVoiceQuality("generic");
    setVoice("Kore");
    setLanguage("en-IN");
    setVoiceGender("female");
    setVoicePreviewUrl("");
    setVoicePreviewText("Hello, this is a quick ReachConvert voice preview.");
    setAiCallingBotId(null);
    setSelectedContactIds([]);
    setContactSearch("");
    setSelectedContactDirectoryId("all");
    setGenerationJobId(null);
    handledGenerationJobIdRef.current = null;
    setEditingCampaignId(null);
  };

  const hasPhoneNumber = (contact: Contact) =>
    Boolean(contact.phoneNumber?.trim());

  const getContactsByDirectory = (
    contactList: Contact[],
    directoryId: DirectoryFilter,
  ) =>
    contactList.filter((contact) => {
      if (directoryId === "all") return true;
      if (directoryId === "uncategorized") return !contact.directoryId;
      return contact.directoryId === directoryId;
    });

  const matchesContactSearch = (contact: Contact, term: string) => {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) return true;
    return (
      contact.firstName.toLowerCase().includes(normalizedTerm) ||
      contact.lastName.toLowerCase().includes(normalizedTerm) ||
      contact.email.toLowerCase().includes(normalizedTerm) ||
      (contact.phoneNumber || "").toLowerCase().includes(normalizedTerm) ||
      (contact.company || "").toLowerCase().includes(normalizedTerm)
    );
  };

  const callableContacts = contacts.filter(hasPhoneNumber);
  const callableDirectoryOptions = contactDirectories
    .map((directory) => ({
      ...directory,
      callableCount: callableContacts.filter(
        (contact) => contact.directoryId === directory.id,
      ).length,
    }))
    .filter((directory) => directory.callableCount > 0);
  const unassignedCallableCount = callableContacts.filter(
    (contact) => !contact.directoryId,
  ).length;

  const selectDirectoryFallback = (
    directoryId: DirectoryFilter,
    availableContacts: Contact[],
  ): DirectoryFilter => {
    if (directoryId === "all") return "all";
    if (directoryId === "uncategorized") {
      return availableContacts.some((contact) => !contact.directoryId)
        ? "uncategorized"
        : "all";
    }
    return availableContacts.some(
      (contact) => contact.directoryId === directoryId,
    )
      ? directoryId
      : "all";
  };

  const toggleCreateContactSelection = (contactId: string) => {
    setSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  };

  const toggleAddContactSelection = (contactId: string) => {
    setAddSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  };

  const handleVoiceChange = (voiceName: string) => {
    setVoice(voiceName);
    setVoicePreviewUrl("");
  };

  const handleLanguageChange = (languageName: string) => {
    const newPreviewText =
      LANGUAGE_PREVIEW_TEXTS[languageName] || LANGUAGE_PREVIEW_TEXTS["en-IN"];
    if (voiceQuality === "hd") {
      setLanguage(languageName);
      setVoicePreviewUrl("");
      setVoicePreviewText(newPreviewText);
      setVoice(
        normalizeHdVoiceForLanguageAndGender(voice, languageName, voiceGender),
      );
      return;
    }
    const nextVoices = getVoicesForLanguageAndGender(languageName, voiceGender);
    setLanguage(languageName);
    setVoicePreviewText(newPreviewText);
    if (!nextVoices.some((option) => option.value === voice)) {
      setVoice(nextVoices[0]?.value || "Kore");
    }
    setVoicePreviewUrl("");
  };

  const handleQualityChange = (mode: "generic" | "hd") => {
    setVoiceQuality(mode);
    setVoicePreviewUrl("");
    if (mode === "hd") {
      const nextLanguage = normalizeHdLanguageValue(language, voice);
      const nextGender = getHdVoiceDefaultGender(voice);
      setLanguage(nextLanguage);
      setVoiceGender(nextGender);
      setVoice(
        normalizeHdVoiceForLanguageAndGender(voice, nextLanguage, nextGender),
      );
      setVoicePreviewText(
        LANGUAGE_PREVIEW_TEXTS[nextLanguage] || LANGUAGE_PREVIEW_TEXTS["en-IN"],
      );
      return;
    }
    const nextVoice = normalizeVoiceValue(voice);
    const nextLanguage = normalizeCampaignLanguage(nextVoice, language);
    const nextGender = getVoiceDefaultGender(nextVoice);
    setLanguage(nextLanguage);
    setVoiceGender(nextGender);
    setVoice(
      normalizeVoiceForLanguageAndGender(nextVoice, nextLanguage, nextGender),
    );
    setVoicePreviewText(
      LANGUAGE_PREVIEW_TEXTS[nextLanguage] || LANGUAGE_PREVIEW_TEXTS["en-IN"],
    );
  };

  const handleVoiceGenderChange = (gender: VoiceGender) => {
    if (voiceQuality === "hd") {
      setVoiceGender(gender);
      const nextVoices = getHdVoices(language, gender);
      if (!nextVoices.some((v) => v.value === voice)) {
        setVoice(nextVoices[0]?.value || "");
      }
      setVoicePreviewUrl("");
      return;
    }
    const nextVoices = getVoicesForLanguageAndGender(language, gender);
    setVoiceGender(gender);
    if (!nextVoices.some((option) => option.value === voice)) {
      setVoice(nextVoices[0]?.value || "Kore");
    }
    setVoicePreviewUrl("");
  };

  const handleAiBotSelect = (bot: AiCallingBot, isSelected: boolean) => {
    if (isSelected) {
      setAiCallingBotId(null);
      return;
    }

    setAiCallingBotId(bot.id);
    if (!bot.voice && !bot.language) return;

    const nextLanguage = normalizeHdLanguageValue(bot.language, bot.voice);
    const nextGender = getHdVoiceDefaultGender(bot.voice);
    setVoiceQuality("hd");
    setLanguage(nextLanguage);
    setVoiceGender(nextGender);
    setVoice(
      normalizeHdVoiceForLanguageAndGender(bot.voice, nextLanguage, nextGender),
    );
    setVoicePreviewText(
      LANGUAGE_PREVIEW_TEXTS[nextLanguage] || LANGUAGE_PREVIEW_TEXTS["en-IN"],
    );
    setVoicePreviewUrl("");
  };

  const isGeneratingCampaign =
    generateCallingCampaignMutation.isPending ||
    generationJob?.status === "PENDING" ||
    generationJob?.status === "PROCESSING";
  const filteredVoiceOptions = getVoicesForLanguageAndGender(
    language,
    voiceGender,
  );

  const handleCreateDirectoryChange = (directoryId: DirectoryFilter) => {
    setSelectedContactDirectoryId(directoryId);
    setSelectedContactIds((current) =>
      current.filter((id) => {
        const contact = callableContacts.find((item) => item.id === id);
        if (!contact) return false;
        if (directoryId === "all") return true;
        if (directoryId === "uncategorized") return !contact.directoryId;
        return contact.directoryId === directoryId;
      }),
    );
  };

  const handleAddDirectoryChange = (directoryId: DirectoryFilter) => {
    setAddContactsDirectoryId(directoryId);
    setAddSelectedContactIds((current) =>
      current.filter((id) => {
        const contact = contacts.find((item) => item.id === id);
        if (!contact) return false;
        if (directoryId === "all") return true;
        if (directoryId === "uncategorized") return !contact.directoryId;
        return contact.directoryId === directoryId;
      }),
    );
  };

  const createDirectoryContacts = getContactsByDirectory(
    callableContacts,
    selectDirectoryFallback(selectedContactDirectoryId, callableContacts),
  );
  const createFilteredContacts = createDirectoryContacts.filter((contact) =>
    matchesContactSearch(contact, contactSearch),
  );
  const selectedCreateContactsInView = createFilteredContacts.filter(
    (contact) => selectedContactIds.includes(contact.id),
  );

  const toggleCreateSelectAll = () => {
    if (createFilteredContacts.length === 0) return;
    setSelectedContactIds((current) => {
      const visibleIds = new Set(
        createFilteredContacts.map((contact) => contact.id),
      );
      const allVisibleSelected = createFilteredContacts.every((contact) =>
        current.includes(contact.id),
      );
      if (allVisibleSelected)
        return current.filter((id) => !visibleIds.has(id));

      const next = new Set(current);
      createFilteredContacts.forEach((contact) => next.add(contact.id));
      return Array.from(next);
    });
  };

  const availableAddContacts = contacts.filter((contact) => {
    const alreadyInCampaign = campaignDetails?.calls?.some(
      (call: LooseApiResponse) => call.contactId === contact.id,
    );

    return hasPhoneNumber(contact) && !alreadyInCampaign;
  });
  const addDirectoryContacts = getContactsByDirectory(
    availableAddContacts,
    selectDirectoryFallback(addContactsDirectoryId, availableAddContacts),
  );
  const availableAddFilteredContacts = addDirectoryContacts.filter((contact) =>
    matchesContactSearch(contact, addContactSearch),
  );
  const selectedAddContactsInView = availableAddFilteredContacts.filter(
    (contact) => addSelectedContactIds.includes(contact.id),
  );

  const toggleAddSelectAll = () => {
    if (availableAddFilteredContacts.length === 0) return;
    setAddSelectedContactIds((current) => {
      const visibleIds = new Set(
        availableAddFilteredContacts.map((contact) => contact.id),
      );
      const allVisibleSelected = availableAddFilteredContacts.every((contact) =>
        current.includes(contact.id),
      );
      if (allVisibleSelected)
        return current.filter((id) => !visibleIds.has(id));

      const next = new Set(current);
      availableAddFilteredContacts.forEach((contact) => next.add(contact.id));
      return Array.from(next);
    });
  };

  const startEditCampaign = async (campaign: LooseApiResponse) => {
    try {
      const details = campaign.calls
        ? campaign
        : await queryClient.fetchQuery({
            queryKey: ["calling-campaign", campaign.id],
            queryFn: () => api.callingCampaigns.get(campaign.id),
          });
      const existingContactIds = details.calls
        ? details.calls.map((call: LooseApiResponse) => call.contactId)
        : [];

      setSelectedCampaignId(details.id);
      setEditingCampaignId(details.id);
      setName(details.name || "");
      setObjective(details.objective || "");
      setPrompt(details.prompt || "");
      const nextVoiceQuality = details.voiceQuality || "generic";
      setVoiceQuality(nextVoiceQuality);
      const nextLanguage =
        nextVoiceQuality === "hd"
          ? normalizeHdLanguageValue(details.language, details.voice)
          : normalizeCampaignLanguage(details.voice, details.language);
      const nextGender =
        nextVoiceQuality === "hd"
          ? getHdVoiceDefaultGender(details.voice)
          : getVoiceDefaultGender(normalizeVoiceValue(details.voice));
      setVoiceGender(nextGender);
      setVoice(
        nextVoiceQuality === "hd"
          ? normalizeHdVoiceForLanguageAndGender(
              details.voice,
              nextLanguage,
              nextGender,
            )
          : normalizeVoiceForLanguageAndGender(
              details.voice,
              nextLanguage,
              nextGender,
            ),
      );
      setLanguage(nextLanguage);
      setVoicePreviewText(
        LANGUAGE_PREVIEW_TEXTS[nextLanguage] || LANGUAGE_PREVIEW_TEXTS["en-IN"],
      );
      setAiCallingBotId(details.aiCallingBotId || null);
      setSelectedContactIds(existingContactIds);
      setContactSearch("");
      setSelectedContactDirectoryId("all");
      setActiveTab("create");
    } catch (err) {
      showAlert(
        err instanceof Error
          ? err.message
          : "We could not open this campaign for editing.",
        "error",
      );
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm("Delete this calling campaign and its call logs?")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  const handleLaunchCampaign = (campaign: LooseApiResponse) => {
    if (isCampaignActive(campaign.status)) return;
    const isRelaunch = campaign.status !== "DRAFT";
    console.debug("[AI Calling] Launch requested", {
      campaignId: campaign.id,
      status: campaign.status,
      contactCount: campaign.contactCount,
      isRelaunch,
    });
    launchCampaignMutation.mutate({ id: campaign.id, isRelaunch });
  };

  const handleStopCampaign = (campaign: LooseApiResponse) => {
    if (!isCampaignActive(campaign.status)) return;
    if (
      confirm(
        "Stop this campaign now? Pending and queued calls will be cancelled.",
      )
    ) {
      stopCampaignMutation.mutate(campaign.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert(
        "Please enter a campaign name so you can recognize it later.",
        "error",
      );
      return;
    }
    if (!editingCampaignId && selectedContactIds.length === 0) {
      showAlert(
        "Please select at least one contact before saving this calling campaign.",
        "error",
      );
      return;
    }

    const payloadLanguage =
      voiceQuality === "hd"
        ? normalizeHdLanguageValue(language, voice)
        : language;
    const payloadVoice =
      voiceQuality === "hd"
        ? buildGoogleHdVoice(
            normalizeHdVoiceForLanguageAndGender(
              voice,
              payloadLanguage,
              voiceGender,
            ),
            payloadLanguage,
          )
        : voice;

    const payload = {
      name,
      objective,
      prompt,
      voiceQuality,
      voice: payloadVoice,
      language: payloadLanguage,
      aiCallingBotId: aiCallingBotId || undefined,
      contactIds: selectedContactIds,
    };

    console.debug("[AI Calling] Saving campaign", {
      mode: editingCampaignId ? "edit" : "create",
      campaignId: editingCampaignId,
      selectedContacts: selectedContactIds.length,
    });

    if (editingCampaignId) {
      updateCampaignMutation.mutate({ id: editingCampaignId, data: payload });
    } else {
      createCampaignMutation.mutate(payload);
    }
  };

  // Convert transcript text into readable structured conversation bubbles
  const renderTranscriptBubbles = (transcriptText: string) => {
    if (!transcriptText)
      return (
        <p className="text-xs text-zinc-500 italic">
          No conversational transcript recorded.
        </p>
      );

    // Expected format: "Agent: Hello... Customer: Hi..."
    const lines = transcriptText.split("\n").filter((l) => l.trim());
    return (
      <div className="space-y-3 pt-2">
        {lines.map((line, idx) => {
          const isAgent =
            line.startsWith("AI Agent:") || line.startsWith("Agent:");
          const cleanText = line
            .replace(/^(AI Agent:|Agent:|Customer:)/, "")
            .trim();

          return (
            <div
              key={idx}
              className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                  isAgent
                    ? "bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none"
                    : "bg-indigo-600 text-white rounded-br-none"
                }`}
              >
                <span className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                  {isAgent ? "AI Agent" : "Contact"}
                </span>
                {cleanText}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (
    settings &&
    (!settings.twilioAccountSid ||
      !settings.twilioAuthToken ||
      !settings.twilioPhoneNumber)
  ) {
    return (
      <MissingCredentials
        title="Twilio Credentials Required"
        description="To create and manage AI calling campaigns, you need to configure your Twilio Account SID, Auth Token, and Phone Number in settings."
      />
    );
  }

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
            Configure automated calling schedules with voice simulation agents
            and detailed transcript logs.
          </p>
        </div>
        {activeTab === "list" && (
          <button
            onClick={() => {
              resetForm();
              setActiveTab("create");
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Campaign
          </button>
        )}
        {activeTab !== "list" && (
          <button
            onClick={() => setActiveTab("list")}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all"
          >
            Back to Campaigns
          </button>
        )}
      </div>

      {/* Campaign List Tab */}
      {activeTab === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isListLoading ? (
            [1, 2].map((n) => (
              <div
                key={n}
                className="h-48 bg-zinc-900 border border-zinc-850 rounded-2xl animate-pulse"
              ></div>
            ))
          ) : campaigns.length > 0 ? (
            campaigns.map((camp: LooseApiResponse) => {
              const statusColors: Record<string, string> = {
                DRAFT: "bg-zinc-850 text-zinc-400 border-zinc-800",
                LAUNCHING:
                  "bg-amber-500/10 text-amber-300 border-amber-500/15",
                RUNNING:
                  "bg-indigo-500/10 text-indigo-400 border-indigo-500/10",
                COMPLETED:
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
                STOPPED: "bg-zinc-800 text-zinc-300 border-zinc-700",
                FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/10",
              };

              return (
                <div
                  key={camp.id}
                  className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:bg-zinc-900/60 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[camp.status] || statusColors.DRAFT}`}
                      >
                        {camp.status}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => startEditCampaign(camp)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/70"
                          title="Edit campaign"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20"
                          title="Delete campaign"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {camp.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {camp.objective || "No objective set"}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-2">
                        {camp.contactCount || 0} callable contacts
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-850/65 pt-4 mt-6">
                    <button
                      onClick={() => {
                        setSelectedCampaignId(camp.id);
                        setActiveTab("detail");
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      View Calls
                    </button>
                    {isCampaignActive(camp.status) ? (
                      <button
                        onClick={() => handleStopCampaign(camp)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                      >
                        <Square className="h-3.5 w-3.5" />
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLaunchCampaign(camp)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                      >
                        {camp.status === "DRAFT" ? (
                          <Play className="h-3.5 w-3.5" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        {camp.status === "DRAFT" ? "Start Dialer" : "Relaunch"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-zinc-850 bg-zinc-900/20 rounded-2xl text-zinc-500">
              No calling campaigns configured. Click &quot;Create Campaign&quot;
              to build an automated dialer pipeline.
            </div>
          )}
        </div>
      )}

      {/* Campaign Details Tab */}
      {activeTab === "detail" && selectedCampaignId && (
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
                    <h3 className="text-xl font-bold text-white">
                      {campaignDetails.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-850 text-zinc-400">
                      {campaignDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Objective: {campaignDetails.objective || "No objective set"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isCampaignActive(campaignDetails.status) ? (
                    <button
                      onClick={() => handleStopCampaign(campaignDetails)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/20 border border-rose-500/15 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200"
                    >
                      <Square className="h-3.5 w-3.5" /> Stop Campaign
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditCampaign(campaignDetails)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setAddSelectedContactIds([]);
                          setAddContactSearch("");
                          setAddContactsDirectoryId("all");
                          setIsAddContactsOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Contacts
                      </button>
                      <button
                        onClick={() => handleLaunchCampaign(campaignDetails)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow-md hover:brightness-110"
                      >
                        {campaignDetails.status === "DRAFT" ? (
                          <Play className="h-3.5 w-3.5" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        {campaignDetails.status === "DRAFT"
                          ? "Launch Pending Calls"
                          : "Relaunch Campaign"}
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaignDetails.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/20 border border-rose-500/15 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Calls List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  Dialed Call Logs
                </h4>

                {campaignDetails.calls && campaignDetails.calls.length > 0 ? (
                  <div className="space-y-4">
                    {campaignDetails.calls.map((call: LooseApiResponse) => {
                      const isExpanded = expandedCallId === call.id;
                      const isPlaying = playingCallId === call.id;
                      const contact = call.contact || {};

                      const outcomeColors: Record<string, string> = {
                        PENDING: "bg-zinc-850 text-zinc-400",
                        QUEUING: "bg-sky-500/10 text-sky-300 border-sky-500/10",
                        QUEUED: "bg-sky-500/10 text-sky-300 border-sky-500/10",
                        DIALING:
                          "bg-indigo-500/10 text-indigo-300 border-indigo-500/10",
                        RINGING: "bg-sky-500/10 text-sky-300 border-sky-500/10",
                        CONNECTED:
                          "bg-emerald-500/10 text-emerald-300 border-emerald-500/10",
                        IN_PROGRESS:
                          "bg-purple-500/10 text-purple-300 border-purple-500/10",
                        ANSWERED:
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
                        NO_ANSWER: "bg-zinc-800 text-zinc-500 border-zinc-800",
                        BUSY: "bg-amber-500/10 text-amber-400 border-amber-500/10",
                        FAILED:
                          "bg-rose-500/10 text-rose-400 border-rose-500/10",
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
                                  {contact.firstName || "Unknown"}{" "}
                                  {contact.lastName || "Contact"}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {contact.email || "No email"} •{" "}
                                  {contact.phoneNumber || "No phone"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${outcomeColors[call.outcome] || outcomeColors.PENDING}`}
                              >
                                {call.outcome}
                              </span>

                              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                {call.duration}s
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Play/Pause Recording */}
                                {call.outcome === "ANSWERED" && (
                                  <button
                                    onClick={() =>
                                      setPlayingCallId(
                                        isPlaying ? null : call.id,
                                      )
                                    }
                                    className={`p-1.5 rounded-xl border transition-all ${
                                      isPlaying
                                        ? "bg-indigo-600 border-indigo-600 text-white animate-pulse"
                                        : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
                                    }`}
                                  >
                                    {isPlaying ? (
                                      <Pause className="h-4.5 w-4.5" />
                                    ) : (
                                      <Volume2 className="h-4.5 w-4.5" />
                                    )}
                                  </button>
                                )}

                                {/* Collapsible Toggle */}
                                <button
                                  onClick={() =>
                                    setExpandedCallId(
                                      isExpanded ? null : call.id,
                                    )
                                  }
                                  className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4.5 w-4.5" />
                                  ) : (
                                    <ChevronDown className="h-4.5 w-4.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Recording waves simulation */}
                          {isPlaying && (
                            <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-850 flex items-center gap-4">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                Recording
                              </span>
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
                              {call.errorMessage && (
                                <div className="rounded-xl border border-rose-500/15 bg-rose-950/10 px-4 py-3 text-xs text-rose-300">
                                  {call.errorMessage}
                                </div>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="rounded-xl border border-zinc-850 bg-zinc-950/70 p-3">
                                  <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                    Session
                                  </span>
                                  <p className="mt-1 text-xs font-semibold text-zinc-200">
                                    {call.sessionStatus || "pending"} ·{" "}
                                    {call.callType || "phone_call"}
                                  </p>
                                  <p className="mt-1 text-[10px] text-zinc-500">
                                    {call.selectedVoice ||
                                      campaignDetails.voice ||
                                      "Kore"}{" "}
                                    ·{" "}
                                    {getLanguageLabel(
                                      call.selectedLanguage ||
                                        campaignDetails.language ||
                                        "en-IN",
                                    )}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-zinc-850 bg-zinc-950/70 p-3">
                                  <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                    Analysis
                                  </span>
                                  <p className="mt-1 text-xs font-semibold text-zinc-200">
                                    {call.analysis?.engagement_score
                                      ? `${call.analysis.engagement_score}% engagement`
                                      : "Not scored"}
                                  </p>
                                  <p className="mt-1 text-[10px] text-zinc-500">
                                    {call.analysis?.intent ||
                                      call.endCallReason ||
                                      "No intent captured"}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-zinc-850 bg-zinc-950/70 p-3">
                                  <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                    Timing
                                  </span>
                                  <p className="mt-1 text-xs font-semibold text-zinc-200">
                                    {call.totalTime
                                      ? `${Math.round(call.totalTime / 1000)}s total`
                                      : `${call.duration || 0}s duration`}
                                  </p>
                                  <p className="mt-1 text-[10px] text-zinc-500">
                                    {call.startupTime
                                      ? `${Math.round(call.startupTime / 1000)}s startup`
                                      : "Startup not recorded"}
                                  </p>
                                </div>
                              </div>
                              {(call.summary || call.keyOutcomes) && (
                                <div className="rounded-xl border border-zinc-850 bg-zinc-950/70 p-4 space-y-2">
                                  {call.summary && (
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                      {call.summary}
                                    </p>
                                  )}
                                  {call.keyOutcomes && (
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                      {call.keyOutcomes}
                                    </p>
                                  )}
                                </div>
                              )}
                              {call.topicsCovered?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {call.topicsCovered.map((topic: string) => (
                                    <span
                                      key={topic}
                                      className="rounded-full border border-indigo-500/15 bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold text-indigo-200"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                    No dialed call history recorded. Start the Dialer to
                    simulate voice conversations.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Tab */}
      {/* Create Campaign Tab */}
      {activeTab === "create" && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full bg-zinc-900/30 border border-zinc-850 p-6 rounded-2xl shadow-xl"
        >
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              {editingCampaignId
                ? "Edit Calling Campaign"
                : "Create Calling Campaign"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Configure your outbound calling AI persona, scripts, and targeting
              options.
            </p>
          </div>
          <div className="space-y-6 ">
            {/* SECTION 1: Campaign Basics */}
            <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                1. Campaign Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Follow-Up Voice Dialer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Dialer Objective
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call leads to schedule product demo bookings"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  Campaign Context
                </label>
                <textarea
                  placeholder="e.g. You are Sarah from SalesCorp. Be friendly, ask how their automation is going, and request a 15 min follow-up call."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 h-24 resize-none transition-colors"
                />
              </div>
            </div>

            {/* SECTION 2: AI Generate Campaign */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-4">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="h-24 w-24 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-4.5 w-4.5 text-indigo-400" />
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  AI Campaign Copilot
                </label>
              </div>
              <p className="text-[11px] text-zinc-400">
                Let AI auto-generate your agent persona, knowledge base, rules,
                greeting, and objections based on your description below.
              </p>
              <textarea
                placeholder="Describe the calling campaign you want. Example: Call inbound demo leads for ReachConvert, qualify their outreach needs, handle budget/timing objections, and book a 15 minute demo."
                value={aiCampaignPrompt}
                onChange={(e) => setAiCampaignPrompt(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 h-20 resize-none transition-colors"
              />
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Desired Agent Tone
                  </label>
                  <input
                    type="text"
                    value={aiCampaignTone}
                    onChange={(e) => setAiCampaignTone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  disabled={isGeneratingCampaign || !aiCampaignPrompt.trim()}
                  onClick={() => generateCallingCampaignMutation.mutate()}
                  className="flex h-10 items-center justify-center gap-2 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
                >
                  <Bot className="h-3.5 w-3.5" />
                  {isGeneratingCampaign ? "Generating..." : "Generate Campaign"}
                </button>
              </div>
              {generationJobId && (
                <div className="flex items-center gap-2 text-[11px] text-indigo-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>
                    Generating campaign draft (Job:{" "}
                    {generationJobId.slice(0, 8)})
                  </span>
                </div>
              )}
            </div>

            {/* SECTION 2: Bot Picker */}
            <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  2. Select AI Bot
                </h4>
                {aiCallingBotId && (
                  <button
                    type="button"
                    onClick={() => setAiCallingBotId(null)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              {aiBots.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">
                  No AI bots found. Create a bot in the{" "}
                  <a
                    href="/ai-calling-bots"
                    className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
                  >
                    AI Calling Bots
                  </a>{" "}
                  section first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiBots.map((bot) => {
                    const isSelected = aiCallingBotId === bot.id;
                    return (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => handleAiBotSelect(bot, isSelected)}
                        className={`relative text-left rounded-xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/20"
                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/60"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                            <CheckSquare className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                        <p
                          className={`text-xs font-bold truncate pr-5 ${isSelected ? "text-indigo-300" : "text-zinc-200"}`}
                        >
                          {bot.name || "Unnamed Bot"}
                        </p>
                        {bot.role && (
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {bot.role}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {bot.ragEnabled && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              RAG
                            </span>
                          )}
                          {(bot.trainingChunkCount ?? 0) > 0 && (
                            <span className="text-[9px] text-zinc-500">
                              {bot.trainingChunkCount} chunks
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 3: Voice Setup */}
            <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                3. Voice & Language Configuration
              </h4>

              <div className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1 w-full max-w-[240px]">
                <button
                  type="button"
                  onClick={() => handleQualityChange("generic")}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    voiceQuality === "generic"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  Generic
                </button>
                <button
                  type="button"
                  onClick={() => handleQualityChange("hd")}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    voiceQuality === "hd"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  HD Voices
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Language / Accent
                  </label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="" disabled>
                        Select Language
                      </option>
                      {voiceQuality === "generic"
                        ? VOICE_LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))
                        : antigravityLanguages.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Voice Gender
                  </label>
                  <div className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                    {(["female", "male"] as VoiceGender[]).map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleVoiceGenderChange(gender)}
                        className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors ${
                          voiceGender === gender
                            ? "bg-indigo-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Voice Model
                  </label>
                  <div className="relative">
                    {voiceQuality === "generic" ? (
                      <>
                        <Headphones className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                        <select
                          value={
                            filteredVoiceOptions.some(
                              (option) => option.value === voice,
                            )
                              ? voice
                              : filteredVoiceOptions[0]?.value || voice
                          }
                          onChange={(e) => handleVoiceChange(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          <option value="" disabled>
                            Select Voice
                          </option>
                          {filteredVoiceOptions.map((option) => (
                            <option
                              key={`${option.value}-${option.language}`}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <HDVoiceSelector
                        value={voice}
                        onChange={handleVoiceChange}
                        language={language}
                        gender={voiceGender}
                        previewText={voicePreviewText}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Voice Preview Subcard */}
              {voiceQuality === "generic" && (
                <div className="rounded-xl border border-zinc-850 bg-zinc-950/80 p-3 space-y-3">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    TTS Script Preview
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
                    <input
                      type="text"
                      value={voicePreviewText}
                      onChange={(e) => {
                        setVoicePreviewText(e.target.value);
                        setVoicePreviewUrl("");
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      disabled={
                        previewVoiceMutation.isPending ||
                        !voicePreviewText.trim()
                      }
                      onClick={() => previewVoiceMutation.mutate()}
                      className="flex h-9 items-center justify-center gap-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-100 disabled:opacity-50 transition-colors"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
                      {previewVoiceMutation.isPending
                        ? "Generating..."
                        : "Preview Voice"}
                    </button>
                  </div>
                  {voicePreviewUrl && (
                    <div className="pt-2 border-t border-zinc-850/50">
                      <audio
                        controls
                        src={voicePreviewUrl}
                        className="h-8 w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 4: Target Audience */}
            <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  4. Audience Setup
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {selectedContactIds.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div className="relative">
                  <Folder className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                  <select
                    value={selectDirectoryFallback(
                      selectedContactDirectoryId,
                      callableContacts,
                    )}
                    onChange={(e) =>
                      handleCreateDirectoryChange(e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="all">
                      All callable contacts ({callableContacts.length})
                    </option>
                    {unassignedCallableCount > 0 && (
                      <option value="uncategorized">
                        Unassigned ({unassignedCallableCount})
                      </option>
                    )}
                    {callableDirectoryOptions.map((directory) => (
                      <option key={directory.id} value={directory.id}>
                        {directory.name} ({directory.callableCount})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={createFilteredContacts.length === 0}
                  onClick={toggleCreateSelectAll}
                  className="px-4 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-zinc-850 transition-colors"
                >
                  {createFilteredContacts.length > 0 &&
                  selectedCreateContactsInView.length ===
                    createFilteredContacts.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <input
                type="text"
                placeholder="Search contacts by name, email, or phone..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />

              <p className="text-[10px] text-zinc-500">
                {createFilteredContacts.length} callable contacts match filter.{" "}
                {selectedCreateContactsInView.length} selected.
              </p>

              <div className="border border-zinc-850 rounded-xl bg-zinc-950/40 divide-y divide-zinc-850 max-h-64 overflow-y-auto">
                {createFilteredContacts.length > 0 ? (
                  createFilteredContacts.map((contact) => (
                    <button
                      type="button"
                      key={contact.id}
                      onClick={() => toggleCreateContactSelection(contact.id)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors"
                    >
                      <span>
                        <span className="block text-xs font-semibold text-zinc-200">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5">
                          {contact.email} • {contact.phoneNumber || "No phone"}
                        </span>
                      </span>
                      <span
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                          selectedContactIds.includes(contact.id)
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-zinc-800 bg-zinc-950"
                        }`}
                      >
                        {selectedContactIds.includes(contact.id) && (
                          <CheckSquare className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    {contacts.length === 0
                      ? "No contacts found. Import contacts first."
                      : callableContacts.length === 0
                        ? "No contacts with phone numbers found."
                        : "No callable contacts match search filter."}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab(selectedCampaignId ? "detail" : "list");
              }}
              className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createCampaignMutation.isPending ||
                updateCampaignMutation.isPending
              }
              className="px-6 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-semibold text-white rounded-xl shadow-md hover:brightness-110 transition-all"
            >
              {editingCampaignId ? "Update Campaign" : "Save Campaign"}
            </button>
          </div>
        </form>
      )}

      {isAddContactsOpen && selectedCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white">
                Add Contacts to Calling Campaign
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddContactsOpen(false);
                  setAddContactSearch("");
                  setAddContactsDirectoryId("all");
                  setAddSelectedContactIds([]);
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <div className="relative">
                  <Folder className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <select
                    value={selectDirectoryFallback(
                      addContactsDirectoryId,
                      availableAddContacts,
                    )}
                    onChange={(e) => handleAddDirectoryChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">
                      All callable contacts ({availableAddContacts.length})
                    </option>
                    {availableAddContacts.some(
                      (contact) => !contact.directoryId,
                    ) && (
                      <option value="uncategorized">
                        Unassigned (
                        {
                          availableAddContacts.filter(
                            (contact) => !contact.directoryId,
                          ).length
                        }
                        )
                      </option>
                    )}
                    {contactDirectories
                      .map((directory) => ({
                        ...directory,
                        callableCount: availableAddContacts.filter(
                          (contact) => contact.directoryId === directory.id,
                        ).length,
                      }))
                      .filter((directory) => directory.callableCount > 0)
                      .map((directory) => (
                        <option key={directory.id} value={directory.id}>
                          {directory.name} ({directory.callableCount})
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={availableAddFilteredContacts.length === 0}
                  onClick={toggleAddSelectAll}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-50"
                >
                  {availableAddFilteredContacts.length > 0 &&
                  selectedAddContactsInView.length ===
                    availableAddFilteredContacts.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <input
                type="text"
                placeholder="Search contacts by name, email, or phone..."
                value={addContactSearch}
                onChange={(e) => setAddContactSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-zinc-500">
                {availableAddFilteredContacts.length} callable contacts in view,{" "}
                {selectedAddContactsInView.length} selected here.
              </p>

              <div className="border border-zinc-850 rounded-xl bg-zinc-950/40 divide-y divide-zinc-850 max-h-[300px] overflow-y-auto">
                {availableAddFilteredContacts.length > 0 ? (
                  availableAddFilteredContacts.map((contact) => (
                    <button
                      type="button"
                      key={contact.id}
                      onClick={() => toggleAddContactSelection(contact.id)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors"
                    >
                      <span>
                        <span className="block text-xs font-semibold text-zinc-200">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5">
                          {contact.email} • {contact.phoneNumber || "No phone"}
                        </span>
                      </span>
                      <span
                        className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                          addSelectedContactIds.includes(contact.id)
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-zinc-800 bg-zinc-950"
                        }`}
                      >
                        {addSelectedContactIds.includes(contact.id) && (
                          <CheckSquare className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No available callable contacts found.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddContactsOpen(false);
                    setAddContactSearch("");
                    setAddContactsDirectoryId("all");
                    setAddSelectedContactIds([]);
                  }}
                  className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    addSelectedContactIds.length === 0 ||
                    addContactsMutation.isPending
                  }
                  onClick={() => {
                    console.debug("[AI Calling] Adding contacts to campaign", {
                      campaignId: selectedCampaignId,
                      selectedContacts: addSelectedContactIds.length,
                    });
                    addContactsMutation.mutate({
                      id: selectedCampaignId,
                      contactIds: addSelectedContactIds,
                    });
                  }}
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
