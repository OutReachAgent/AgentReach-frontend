/**
 * Chirp3-HD voice name → gender mapping.
 * Based on Google Cloud TTS Chirp3-HD documentation.
 */
export type HdVoiceGender = "male" | "female";

export const HD_VOICE_GENDER: Record<string, HdVoiceGender> = {
  // Male
  Puck: "male",
  Fenrir: "male",
  Charon: "male",
  Iapetus: "male",
  Rasalgethi: "male",
  Alnilam: "male",
  Orus: "male",
  Achird: "male",
  Umbriel: "male",
  Algieba: "male",
  Zubenelgenubi: "male",
  Schedar: "male",
  Sadachbia: "male",
  Enceladus: "male",
  Algenib: "male",
  Sadaltager: "male",
  // Female
  Laomedeia: "female",
  Kore: "female",
  Erinome: "female",
  Aoede: "female",
  Zephyr: "female",
  Autonoe: "female",
  Sulafat: "female",
  Vindemiatrix: "female",
  Callirrhoe: "female",
  Despina: "female",
  Leda: "female",
  Pulcherrima: "female",
  Achernar: "female",
  Gacrux: "female",
};

export type HdVoiceEntry = {
  value: string; // e.g. "Puck"
  label: string; // e.g. "Puck – Upbeat"
  gender: HdVoiceGender;
};

/**
 * All Chirp3-HD voices with their label and gender.
 * These voice NAMES are language-agnostic — they are combined with the
 * BCP-47 language code at call time: `{langCode}-Chirp3-HD-{name}`
 * e.g.  en-IN-Chirp3-HD-Puck, hi-IN-Chirp3-HD-Aoede
 *
 * Availability per language differs; see HD_VOICES_BY_LANGUAGE for the
 * filtered set that each language actually supports.
 */
export const ALL_HD_VOICES: HdVoiceEntry[] = [
  { value: "Puck", label: "Puck – Upbeat", gender: "male" },
  { value: "Fenrir", label: "Fenrir – Excitable", gender: "male" },
  { value: "Charon", label: "Charon – Informative", gender: "male" },
  { value: "Iapetus", label: "Iapetus – Clear", gender: "male" },
  { value: "Rasalgethi", label: "Rasalgethi – Informative", gender: "male" },
  { value: "Alnilam", label: "Alnilam – Firm", gender: "male" },
  { value: "Orus", label: "Orus – Firm", gender: "male" },
  { value: "Achird", label: "Achird – Friendly", gender: "male" },
  { value: "Umbriel", label: "Umbriel – Easy-going", gender: "male" },
  { value: "Algieba", label: "Algieba – Smooth", gender: "male" },
  { value: "Zubenelgenubi", label: "Zubenelgenubi – Casual", gender: "male" },
  { value: "Schedar", label: "Schedar – Even", gender: "male" },
  { value: "Sadachbia", label: "Sadachbia – Lively", gender: "male" },
  { value: "Enceladus", label: "Enceladus – Breathy", gender: "male" },
  { value: "Algenib", label: "Algenib – Gravelly", gender: "male" },
  { value: "Sadaltager", label: "Sadaltager – Knowledgeable", gender: "male" },
  { value: "Laomedeia", label: "Laomedeia – Upbeat", gender: "female" },
  { value: "Kore", label: "Kore – Firm", gender: "female" },
  { value: "Erinome", label: "Erinome – Clear", gender: "female" },
  { value: "Aoede", label: "Aoede – Breezy", gender: "female" },
  { value: "Zephyr", label: "Zephyr – Bright", gender: "female" },
  { value: "Autonoe", label: "Autonoe – Bright", gender: "female" },
  { value: "Sulafat", label: "Sulafat – Warm", gender: "female" },
  { value: "Vindemiatrix", label: "Vindemiatrix – Gentle", gender: "female" },
  { value: "Callirrhoe", label: "Callirrhoe – Easy-going", gender: "female" },
  { value: "Despina", label: "Despina – Smooth", gender: "female" },
  { value: "Leda", label: "Leda – Youthful", gender: "female" },
  { value: "Pulcherrima", label: "Pulcherrima – Forward", gender: "female" },
  { value: "Achernar", label: "Achernar – Soft", gender: "female" },
  { value: "Gacrux", label: "Gacrux – Mature", gender: "female" },
];

/**
 * Per-language subsets of Chirp3-HD voices.
 * Keys are the BCP-47 codes used in the geminiLanguageLabels options.
 * "all" means all ALL_HD_VOICES are available for that language.
 * List is based on Google's Chirp3-HD language availability matrix.
 */
export const HD_VOICES_BY_LANGUAGE: Record<string, string[] | "all"> = {
  // Indian languages — broad support
  "en-IN": "all",
  "hi-IN": [
    "Puck",
    "Fenrir",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Schedar",
    "Sadachbia",
    "Autonoe",
    "Algenib",
    "Despina",
    "Enceladus",
    "Iapetus",
    "Algieba",
  ],
  "bn-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
    "Algieba",
  ],
  "gu-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  "kn-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  "ml-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  "mr-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  "ta-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  "te-IN": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Fenrir",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  // European / Global
  "en-US": "all",
  "en-GB": "all",
  "es-ES": [
    "Puck",
    "Fenrir",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Schedar",
    "Sadachbia",
    "Autonoe",
    "Algenib",
    "Despina",
    "Enceladus",
    "Iapetus",
    "Algieba",
    "Zubenelgenubi",
    "Vindemiatrix",
  ],
  "es-MX": [
    "Puck",
    "Fenrir",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
    "Algieba",
  ],
  "fr-FR": [
    "Puck",
    "Fenrir",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Schedar",
    "Sadachbia",
    "Autonoe",
    "Algenib",
    "Despina",
    "Enceladus",
    "Iapetus",
    "Algieba",
  ],
  "fr-CA": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
  ],
  "de-DE": [
    "Puck",
    "Fenrir",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Schedar",
    "Sadachbia",
    "Autonoe",
    "Algenib",
    "Despina",
    "Enceladus",
    "Iapetus",
    "Algieba",
  ],
  "it-IT": [
    "Puck",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Autonoe",
    "Algieba",
  ],
  "pt-BR": [
    "Puck",
    "Fenrir",
    "Charon",
    "Kore",
    "Aoede",
    "Zephyr",
    "Laomedeia",
    "Achird",
    "Erinome",
    "Orus",
    "Sulafat",
    "Schedar",
    "Sadachbia",
    "Autonoe",
    "Algenib",
    "Despina",
    "Enceladus",
    "Iapetus",
    "Algieba",
  ],
  // European languages — broad voice support
  "nl-NL": "all",
  "pl-PL": "all",
  "ru-RU": "all",
  "tr-TR": "all",
  "el-GR": "all",
  "cs-CZ": "all",
  "hu-HU": "all",
  "ro-RO": "all",
  "sv-SE": "all",
  "zh-CN": "all",
};

/** Returns filtered HdVoiceEntry[] for a given language + optional gender filter */
export function getHdVoices(
  languageCode: string,
  gender?: HdVoiceGender,
): HdVoiceEntry[] {
  const allowed = HD_VOICES_BY_LANGUAGE[languageCode];
  let voices: HdVoiceEntry[];
  if (!allowed) {
    voices = [];
  } else if (allowed === "all") {
    voices = ALL_HD_VOICES;
  } else {
    const set = new Set(allowed);
    voices = ALL_HD_VOICES.filter((v) => set.has(v.value));
  }
  if (gender) voices = voices.filter((v) => v.gender === gender);
  return voices;
}

/**
 * Language picker groups for HD mode.
 * Values are BCP-47 codes matching the keys in HD_VOICES_BY_LANGUAGE.
 */
export const geminiLanguageLabels = [
  {
    label: "Indian Languages",
    options: [
      { label: "English (India)", value: "en-IN" },
      { label: "Hindi (India)", value: "hi-IN" },
      { label: "Bengali (India)", value: "bn-IN" },
      { label: "Gujarati (India)", value: "gu-IN" },
      { label: "Kannada (India)", value: "kn-IN" },
      { label: "Malayalam (India)", value: "ml-IN" },
      { label: "Marathi (India)", value: "mr-IN" },
      { label: "Tamil (India)", value: "ta-IN" },
      { label: "Telugu (India)", value: "te-IN" },
    ],
  },
  {
    label: "European Languages",
    options: [
      { label: "English (US)", value: "en-US" },
      { label: "English (UK)", value: "en-GB" },
      { label: "Spanish (Spain)", value: "es-ES" },
      { label: "Spanish (Mexico)", value: "es-MX" },
      { label: "French (France)", value: "fr-FR" },
      { label: "French (Canada)", value: "fr-CA" },
      { label: "German (Germany)", value: "de-DE" },
      { label: "Italian (Italy)", value: "it-IT" },
      { label: "Portuguese (Brazil)", value: "pt-BR" },
      { label: "Dutch (Netherlands)", value: "nl-NL" },
      { label: "Polish (Poland)", value: "pl-PL" },
      { label: "Russian (Russia)", value: "ru-RU" },
      { label: "Turkish (Turkey)", value: "tr-TR" },
      { label: "Greek (Greece)", value: "el-GR" },
      { label: "Czech (Czech Republic)", value: "cs-CZ" },
      { label: "Hungarian (Hungary)", value: "hu-HU" },
      { label: "Romanian (Romania)", value: "ro-RO" },
      { label: "Swedish (Sweden)", value: "sv-SE" },
    ],
  },
  {
    label: "Asian Languages",
    options: [
      { label: "Mandarin Chinese (Mainland)", value: "zh-CN" },
    ],
  },
];

/** @deprecated use getHdVoices() instead */
export const geminiVoiceLabels = [
  {
    label: "All Voices",
    options: ALL_HD_VOICES.map((v) => ({ label: v.label, value: v.value })),
  },
];
