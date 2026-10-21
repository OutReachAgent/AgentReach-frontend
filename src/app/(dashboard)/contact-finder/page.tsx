"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ContactFinderSavePerson,
  ContactFinderSearchParams,
  HunterPerson,
  LooseApiResponse,
} from "@/lib/api";
import { useOutreachStore } from "@/store/useOutreachStore";
import { MissingCredentials } from "@/components/MissingCredentials";
import { useEscapeKey } from "@/lib/useEscapeKey";
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  BadgeCheck,
  ExternalLink,
  History,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UserSearch,
  X,
} from "lucide-react";

const INPUT_CLASS =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50";
// Hunter accepts up to 100 people per domain-search request. Keep the UI
// aligned with that API maximum so a result set such as 99 people loads in
// one search instead of being artificially split into ten-row pages.
const PAGE_SIZE = 100;
const FREE_PLAN_PAGE_SIZE = 10;
const LOW_USAGE = 3;
const NEW_LIST = "__new__";
const RECENT_KEY = "reachconvert:contact-finder:recent";
const RECENT_EVENT = "reachconvert:contact-finder-recent";
const MAX_RECENT = 5;

const SENIORITIES: [string, string][] = [
  ["junior", "Junior"],
  ["senior", "Senior"],
  ["executive", "Executive"],
];
const DEPARTMENTS: [string, string][] = [
  ["executive", "Executive"],
  ["sales", "Sales"],
  ["marketing", "Marketing"],
  ["management", "Management"],
  ["it", "IT"],
  ["product", "Product"],
  ["operations", "Operations"],
  ["finance", "Finance"],
  ["hr", "HR"],
  ["support", "Support"],
  ["design", "Design"],
  ["legal", "Legal"],
  ["communication", "Communication"],
  ["research", "Research"],
  ["consulting", "Consulting"],
  ["procurement", "Procurement"],
  ["administrative", "Administrative"],
  ["education", "Education"],
  ["health", "Health"],
];
const VERIFICATION_LABELS: Record<string, string> = {
  valid: "Verified",
  accept_all: "Accept-all",
  unknown: "Unverified",
  invalid: "Invalid",
  webmail: "Webmail",
  disposable: "Disposable",
};
const VERIFICATION_STYLES: Record<string, string> = {
  valid: "bg-emerald-500/10 text-emerald-400",
  accept_all: "bg-amber-500/10 text-amber-400",
  invalid: "bg-rose-500/10 text-rose-400",
  disposable: "bg-rose-500/10 text-rose-400",
};
// Addresses that would bounce and hurt the SES sending reputation.
const RISKY_STATUSES = new Set(["invalid", "disposable"]);
const VERIFICATION_FILTERS: [VerificationFilter, string][] = [
  ["all", "All statuses"],
  ["valid", "Verified"],
  ["accept_all", "Accept-all"],
  ["unverified", "Unverified"],
  ["risky", "Invalid or disposable"],
];

type Names = { firstName: string; lastName: string };
type ContactLocation = NonNullable<ContactFinderSearchParams["location"]>;
type VerificationFilter = "all" | "valid" | "accept_all" | "unverified" | "risky";
type RecentSearch = {
  key: string;
  label: string;
  mode: "company" | "person";
  query: ContactFinderSearchParams | null;
  people: HunterPerson[];
  total: number;
  company: string;
  domain: string;
  pattern: string;
};

function confidenceStyle(score: number) {
  if (score >= 80) return "bg-emerald-500/10 text-emerald-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-400";
  return "bg-zinc-700/40 text-zinc-400";
}

/** A value with a dot and no spaces is searched as a domain, otherwise as a company name. */
function toTarget(value: string) {
  const text = value.trim();
  return /^\S+\.\S+$/.test(text) ? { domain: text } : { company: text };
}

function toggleIn(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function labelOf(options: [string, string][], key: string) {
  return options.find(([value]) => value === key)?.[1] || key;
}

function statusOf(person: HunterPerson, verified: Record<string, string>) {
  return verified[person.email] || person.verificationStatus || "unknown";
}

function matchesFilter(status: string, filter: VerificationFilter) {
  if (filter === "all") return true;
  if (filter === "risky") return RISKY_STATUSES.has(status);
  if (filter === "unverified") {
    return !["valid", "accept_all"].includes(status) && !RISKY_STATUSES.has(status);
  }
  return status === filter;
}

// Recent results live in sessionStorage so reopening them spends no Hunter
// searches; they are a convenience and disappear with the tab.
function readRecent() {
  try {
    return window.sessionStorage.getItem(RECENT_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function subscribeRecent(callback: () => void) {
  window.addEventListener(RECENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(RECENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function saveRecent(entry: RecentSearch) {
  try {
    const current: RecentSearch[] = JSON.parse(readRecent());
    const next = [entry, ...current.filter((item) => item.key !== entry.key)].slice(0, MAX_RECENT);
    window.sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(RECENT_EVENT));
}

function searchKey(params: ContactFinderSearchParams) {
  return JSON.stringify({ ...params, limit: undefined, offset: undefined });
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-zinc-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            aria-pressed={value.includes(key)}
            onClick={() => onChange(toggleIn(value, key))}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              value.includes(key)
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200"
                : "border-zinc-800 text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function SaveToContactsModal({
  people,
  onClose,
  onDone,
}: {
  people: ContactFinderSavePerson[];
  onClose: () => void;
  onDone: (emails: string[]) => void;
}) {
  const { showAlert } = useOutreachStore();
  const [directoryId, setDirectoryId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [skipRisky, setSkipRisky] = useState(true);
  useEscapeKey(true, onClose);

  const risky = people.filter((person) =>
    RISKY_STATUSES.has(person.verificationStatus || ""),
  );
  const toSave = skipRisky
    ? people.filter((person) => !RISKY_STATUSES.has(person.verificationStatus || ""))
    : people;

  const { data: directories } = useQuery({
    queryKey: ["contact-directories"],
    queryFn: api.contacts.directories.list,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let listId = directoryId;
      if (directoryId === NEW_LIST) {
        const created = await api.contacts.directories.create({
          name: newListName.trim(),
        });
        listId = created.id;
      }
      return api.contactFinder.save({
        people: toSave,
        directoryId: listId || undefined,
        duplicateStrategy: overwrite ? "OVERWRITE" : "SKIP",
      });
    },
    onSuccess: (res) => {
      showAlert(
        `${res.added} added, ${res.updated} updated, ${res.skipped} skipped.`,
        res.errors.length ? "info" : "success",
        "Contacts updated",
      );
      onDone(toSave.map((person) => person.email));
    },
    onError: (err: Error) =>
      showAlert(err.message || "Could not save contacts.", "error"),
  });

  const newListMissing = directoryId === NEW_LIST && !newListName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save to contacts"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <UserPlus className="h-5 w-5 text-indigo-400" />
            Save {toSave.length} to contacts
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
              Contact list
            </label>
            <select
              value={directoryId}
              onChange={(event) => setDirectoryId(event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">No list</option>
              {(Array.isArray(directories) ? directories : []).map(
                (directory: LooseApiResponse) => (
                  <option key={directory.id} value={directory.id}>
                    {directory.name}
                  </option>
                ),
              )}
              <option value={NEW_LIST}>+ New list…</option>
            </select>
            {directoryId === NEW_LIST && (
              <input
                autoFocus
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="List name, e.g. Stripe hiring managers"
                aria-label="New list name"
                className={`${INPUT_CLASS} mt-2`}
              />
            )}
          </div>
          {risky.length > 0 && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                {risky.length} selected address{risky.length === 1 ? " is" : "es are"} invalid or disposable
              </p>
              <p className="mt-1 text-[11px] leading-5 text-zinc-400">
                Emails to them will bounce, and bounces hurt your sending
                reputation.
              </p>
              <label className="mt-2 flex items-center gap-2 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={skipRisky}
                  onChange={(event) => setSkipRisky(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-indigo-500"
                />
                Leave them out
              </label>
            </div>
          )}
          <label className="flex items-center gap-3 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(event) => setOverwrite(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-indigo-500"
            />
            Update people who are already in my contacts
          </label>
          <p className="text-[11px] leading-5 text-zinc-500">
            Each contact keeps Hunter&apos;s confidence score and verification
            status. You are responsible for having a lawful reason to contact
            them; see the{" "}
            <Link href="/compliance" className="text-indigo-400 underline">
              compliance guide
            </Link>
            .
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !toSave.length || newListMissing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-60"
            >
              {mutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Save to contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonRow({
  person,
  names,
  selected,
  onToggle,
  onNamesChange,
  verification,
  onVerify,
  verifying,
}: {
  person: HunterPerson;
  names: Names;
  selected: boolean;
  onToggle: () => void;
  onNamesChange: (names: Names) => void;
  verification?: string;
  onVerify: () => void;
  verifying: boolean;
}) {
  const needsName = !person.firstName;
  const status = verification || person.verificationStatus || "unknown";
  const selectable = !person.alreadyInContacts && Boolean(names.firstName);
  return (
    <tr
      className={`border-t border-zinc-900 align-top text-xs text-zinc-300 ${
        person.alreadyInContacts ? "opacity-50" : ""
      }`}
    >
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          disabled={!selectable}
          onChange={onToggle}
          aria-label={`Select ${person.email}`}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-indigo-500 disabled:opacity-40"
        />
      </td>
      <td className="px-3 py-3">
        {needsName ? (
          <div className="flex gap-1.5">
            <input
              value={names.firstName}
              onChange={(event) =>
                onNamesChange({ ...names, firstName: event.target.value })
              }
              placeholder="First name"
              aria-label={`First name for ${person.email}`}
              className="w-24 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
            />
            <input
              value={names.lastName}
              onChange={(event) =>
                onNamesChange({ ...names, lastName: event.target.value })
              }
              placeholder="Last name"
              aria-label={`Last name for ${person.email}`}
              className="w-24 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
            />
          </div>
        ) : (
          <p className="font-semibold text-white">
            {person.firstName} {person.lastName}
          </p>
        )}
        <p className="text-zinc-500">{person.position || "—"}</p>
        {person.linkedinUrl && (
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-indigo-400 hover:underline"
          >
            LinkedIn <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </td>
      <td className="px-3 py-3">
        <p className="break-all">{person.email}</p>
        {person.alreadyInContacts && (
          <span className="mt-1 inline-block rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
            In contacts
          </span>
        )}
      </td>
      <td className="px-3 py-3">
        {person.phoneNumber ? (
          <a href={`tel:${person.phoneNumber}`} className="whitespace-nowrap hover:underline">
            {person.phoneNumber}
          </a>
        ) : (
          <span className="text-zinc-500">—</span>
        )}
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded-md px-2 py-1 font-bold ${confidenceStyle(person.confidence)}`}
        >
          {person.confidence}%
        </span>
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded-md px-2 py-1 font-semibold ${
            VERIFICATION_STYLES[status] || "bg-zinc-700/40 text-zinc-400"
          }`}
        >
          {VERIFICATION_LABELS[status] || status}
        </span>
        {!verification && status !== "valid" && (
          <button
            onClick={onVerify}
            disabled={verifying}
            className="mt-2 block font-semibold text-indigo-400 hover:underline disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "Verify"}
          </button>
        )}
      </td>
      <td className="px-3 py-3 capitalize">
        <p>{person.department || "—"}</p>
        <p className="text-zinc-500">{person.seniority}</p>
      </td>
      <td className="px-3 py-3">
        {person.sourceUrl ? (
          <a
            href={person.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
          >
            Page <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

export default function ContactFinderPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useOutreachStore();
  const [mode, setMode] = useState<"company" | "person">("company");
  const [target, setTarget] = useState("");
  const [type, setType] = useState<"personal" | "generic">("personal");
  const [seniority, setSeniority] = useState<string[]>([]);
  const [department, setDepartment] = useState<string[]>([]);
  const [location, setLocation] = useState<ContactLocation>({});
  const [jobTitles, setJobTitles] = useState("");
  const [hiring, setHiring] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [lastQuery, setLastQuery] = useState<ContactFinderSearchParams | null>(
    null,
  );
  const [people, setPeople] = useState<HunterPerson[]>([]);
  const [total, setTotal] = useState(0);
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [pattern, setPattern] = useState("");
  const [names, setNames] = useState<Record<string, Names>>({});
  const [verified, setVerified] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<VerificationFilter>("all");
  const [sortByConfidence, setSortByConfidence] = useState(false);
  const [bulkVerify, setBulkVerify] = useState<{ done: number; total: number } | null>(null);

  const recentRaw = useSyncExternalStore(subscribeRecent, readRecent, () => "[]");
  const recent = useMemo<RecentSearch[]>(() => {
    try {
      const parsed = JSON.parse(recentRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [recentRaw]);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings.get,
  });
  const hasKey = Boolean(settings?.hunterApiKey);

  const accountQuery = useQuery({
    queryKey: ["contact-finder", "account"],
    queryFn: api.contactFinder.account,
    enabled: hasKey,
    retry: false,
  });
  const refreshAccount = () =>
    queryClient.invalidateQueries({ queryKey: ["contact-finder", "account"] });

  const resetSelection = () => {
    setPicked(new Set());
    setNames({});
    setVerified({});
  };

  // Searches spend Hunter credits, so they run as mutations: React Query
  // never re-runs a mutation on focus or retries it on its own.
  const searchMutation = useMutation({
    mutationFn: api.contactFinder.search,
    onSuccess: (res, params) => {
      const append = (params.offset ?? 0) > 0;
      const nextPeople = append ? [...people, ...res.people] : res.people;
      setPeople(nextPeople);
      setTotal(res.total);
      setCompany(res.company || res.domain);
      setDomain(res.domain);
      setPattern(res.pattern);
      setLastQuery(params);
      if (!append) resetSelection();
      saveRecent({
        key: searchKey(params),
        label: params.domain || params.company || res.domain,
        mode: "company",
        query: params,
        people: nextPeople,
        total: res.total,
        company: res.company || res.domain,
        domain: res.domain,
        pattern: res.pattern,
      });
      refreshAccount();
    },
    onError: (err: Error) => {
      showAlert(err.message || "Search failed.", "error");
      refreshAccount();
    },
  });

  const findMutation = useMutation({
    mutationFn: api.contactFinder.findEmail,
    onSuccess: (res, params) => {
      setLastQuery(null);
      resetSelection();
      setPeople(res.person ? [res.person] : []);
      setTotal(res.person ? 1 : 0);
      setCompany(res.person?.company || res.person?.domain || "");
      setDomain(res.person?.domain || "");
      setPattern("");
      if (res.person) {
        saveRecent({
          key: JSON.stringify(params),
          label: `${params.firstName} ${params.lastName} · ${params.domain || params.company}`,
          mode: "person",
          query: null,
          people: [res.person],
          total: 1,
          company: res.person.company || res.person.domain,
          domain: res.person.domain,
          pattern: "",
        });
      } else {
        showAlert("Hunter could not find an email for this person.", "info");
      }
      refreshAccount();
    },
    onError: (err: Error) => {
      showAlert(err.message || "Lookup failed.", "error");
      refreshAccount();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: api.contactFinder.verify,
    onSuccess: (res) => {
      setVerified((prev) => ({ ...prev, [res.email]: res.status }));
      refreshAccount();
    },
    onError: (err: Error) =>
      showAlert(err.message || "Verification failed.", "error"),
  });

  if (settings && !hasKey) {
    return (
      <MissingCredentials
        title="Hunter.io API key required"
        description="Contact Finder uses your Hunter.io key to look up people's work emails. Add it in Settings."
      />
    );
  }

  const namesFor = (person: HunterPerson): Names =>
    names[person.email] || {
      firstName: person.firstName,
      lastName: person.lastName,
    };
  const visiblePeople = people
    .filter((person) => matchesFilter(statusOf(person, verified), statusFilter))
    .sort((a, b) => (sortByConfidence ? b.confidence - a.confidence : 0));
  const selectable = visiblePeople.filter(
    (person) => !person.alreadyInContacts && namesFor(person).firstName.trim(),
  );
  const safeSelectable = selectable.filter(
    (person) => !RISKY_STATUSES.has(statusOf(person, verified)),
  );
  const selectedPeople = people.filter(
    (person) =>
      picked.has(person.email) &&
      !person.alreadyInContacts &&
      namesFor(person).firstName.trim(),
  );
  const toVerify = selectedPeople.filter(
    (person) => !verified[person.email] && person.verificationStatus !== "valid",
  );
  const allSafeSelected =
    safeSelectable.length > 0 &&
    safeSelectable.every((person) => picked.has(person.email));
  const busy = searchMutation.isPending || findMutation.isPending;
  const account = accountQuery.data;
  const isFreePlan = Boolean(
    account?.planName.trim().toLowerCase().startsWith("free"),
  );
  const pageSize = isFreePlan ? FREE_PLAN_PAGE_SIZE : PAGE_SIZE;
  const canLoadMore =
    lastQuery !== null &&
    people.length < total &&
    !searchMutation.isPending &&
    accountQuery.isSuccess &&
    !isFreePlan;

  const usage = account?.credits || account?.searches;
  const outOfSearches = Boolean(usage) && (usage?.remaining ?? 1) <= 0;
  const lowSearches = Boolean(usage) && !outOfSearches && (usage?.remaining ?? 0) <= LOW_USAGE;

  const activeFilters = [
    location.country && { key: "country", label: `Country ${location.country}`, clear: () => setLocation((current) => ({ ...current, country: "" })) },
    location.state && { key: "state", label: `State ${location.state}`, clear: () => setLocation((current) => ({ ...current, state: "" })) },
    location.city && { key: "city", label: location.city, clear: () => setLocation((current) => ({ ...current, city: "" })) },
    jobTitles.trim() && { key: "titles", label: `Titles: ${jobTitles.trim()}`, clear: () => setJobTitles("") },
    hiring && { key: "hiring", label: "Hiring now", clear: () => setHiring(false) },
    type === "generic" && { key: "type", label: "Generic emails", clear: () => setType("personal") },
    ...seniority.map((key) => ({ key: `seniority-${key}`, label: labelOf(SENIORITIES, key), clear: () => setSeniority((list) => list.filter((item) => item !== key)) })),
    ...department.map((key) => ({ key: `department-${key}`, label: labelOf(DEPARTMENTS, key), clear: () => setDepartment((list) => list.filter((item) => item !== key)) })),
  ].filter((item): item is { key: string; label: string; clear: () => void } => Boolean(item));

  const clearFilters = () => {
    setLocation({});
    setJobTitles("");
    setHiring(false);
    setType("personal");
    setSeniority([]);
    setDepartment([]);
  };

  const togglePicked = (email: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!target.trim() || outOfSearches) return;
    if (mode === "company") {
      const cleanLocation = Object.fromEntries(
        Object.entries(location).filter(([, value]) => value?.trim()),
      ) as ContactLocation;
      const cleanJobTitles = jobTitles
        .split(",")
        .map((title) => title.trim())
        .filter(Boolean);
      searchMutation.mutate({
        ...toTarget(target),
        type,
        seniority,
        department,
        location:
          Object.keys(cleanLocation).length > 0 ? cleanLocation : undefined,
        jobTitles: cleanJobTitles.length > 0 ? cleanJobTitles : undefined,
        hiring: hiring || undefined,
        limit: pageSize,
        offset: 0,
      });
    } else {
      if (!firstName.trim() || !lastName.trim()) return;
      findMutation.mutate({
        ...toTarget(target),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    }
  };

  const loadMore = () => {
    if (!lastQuery) return;
    searchMutation.mutate({ ...lastQuery, offset: people.length });
  };

  const restoreRecent = (entry: RecentSearch) => {
    setPeople(entry.people);
    setTotal(entry.total);
    setCompany(entry.company);
    setDomain(entry.domain);
    setPattern(entry.pattern);
    setLastQuery(entry.query);
    resetSelection();
    if (entry.query) setTarget(entry.query.domain || entry.query.company || "");
  };

  const verifySelected = async () => {
    if (!toVerify.length) return;
    setBulkVerify({ done: 0, total: toVerify.length });
    for (const [index, person] of toVerify.entries()) {
      try {
        const res = await api.contactFinder.verify(person.email);
        setVerified((prev) => ({ ...prev, [person.email]: res.status }));
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Verification failed.", "error");
        break;
      }
      setBulkVerify({ done: index + 1, total: toVerify.length });
    }
    setBulkVerify(null);
    refreshAccount();
  };

  const toSave = (person: HunterPerson): ContactFinderSavePerson => {
    const personNames = namesFor(person);
    return {
      email: person.email,
      firstName: personNames.firstName.trim(),
      lastName: personNames.lastName.trim() || undefined,
      position: person.position || undefined,
      company: person.company || undefined,
      linkedinUrl: person.linkedinUrl || undefined,
      phoneNumber: person.phoneNumber || undefined,
      confidence: person.confidence,
      verificationStatus:
        verified[person.email] || person.verificationStatus || undefined,
      sourceUrl: person.sourceUrl || undefined,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-zinc-900 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
            <UserSearch className="h-8 w-8 text-indigo-400" />
            Contact Finder
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Look up people and their work emails at any company with Hunter.io,
            then save the ones you want to Contacts.
          </p>
        </div>
        {usage && account && (
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs text-zinc-400 ${
              outOfSearches
                ? "border-rose-500/30 bg-rose-500/5"
                : lowSearches
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-950/60"
            }`}
          >
            <p>
              <span className="font-bold text-white">{usage.remaining}</span> of{" "}
              {usage.available} {account.credits ? "credits" : "searches"} left
              {account.verifications && (
                <>
                  {" · "}
                  <span className="font-bold text-white">
                    {account.verifications.remaining}
                  </span>{" "}
                  verifications
                </>
              )}
            </p>
            <p className="text-[11px] text-zinc-500">
              {account.planName} plan
              {account.resetDate ? ` · resets ${account.resetDate}` : ""}
              {lowSearches ? " · running low" : ""}
            </p>
          </div>
        )}
      </div>

      {outOfSearches && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <p>
            No Hunter searches left on your {account?.planName} plan
            {account?.resetDate ? ` until ${account.resetDate}` : ""}. You can
            still reopen recent results below without spending a search.
          </p>
        </div>
      )}

      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-zinc-800 p-1">
            {(
              [
                ["company", "Search a company"],
                ["person", "Find one person"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mode === value
                    ? "bg-indigo-500/15 text-indigo-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "company" && (
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showFilters ? "Hide filters" : "More filters"}
              {activeFilters.length > 0 && (
                <span className="rounded-md bg-indigo-500/20 px-1.5 text-[10px] text-indigo-200">
                  {activeFilters.length}
                </span>
              )}
            </button>
          )}
        </div>

        <div
          className={`grid gap-3 ${mode === "person" ? "sm:grid-cols-3" : ""}`}
        >
          {mode === "person" && (
            <>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
                aria-label="First name"
                className={INPUT_CLASS}
              />
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last name"
                aria-label="Last name"
                className={INPUT_CLASS}
              />
            </>
          )}
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Company domain or name, e.g. stripe.com"
            aria-label="Company domain or name"
            className={INPUT_CLASS}
          />
        </div>

        {mode === "company" && !showFilters && activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 py-1 pl-2.5 pr-1 text-xs font-semibold text-indigo-200"
              >
                {filter.label}
                <button
                  type="button"
                  onClick={filter.clear}
                  aria-label={`Remove ${filter.label}`}
                  className="rounded p-0.5 hover:bg-indigo-500/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="px-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
            >
              Clear all
            </button>
          </div>
        )}

        {mode === "company" && showFilters && (
          <div className="space-y-4 border-t border-zinc-900 pt-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-400">
                Contact location
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={location.country || ""}
                  onChange={(event) =>
                    setLocation((current) => ({
                      ...current,
                      country: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Country code (US)"
                  aria-label="Contact country code"
                  maxLength={2}
                  className={INPUT_CLASS}
                />
                <input
                  value={location.state || ""}
                  onChange={(event) =>
                    setLocation((current) => ({
                      ...current,
                      state: event.target.value,
                    }))
                  }
                  placeholder="State code (CA)"
                  aria-label="Contact state code"
                  className={INPUT_CLASS}
                />
                <input
                  value={location.city || ""}
                  onChange={(event) =>
                    setLocation((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                  placeholder="City (San Francisco)"
                  aria-label="Contact city"
                  className={INPUT_CLASS}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Use a two-letter country code when filtering by city or state.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-finder-job-titles"
                  className="mb-1.5 block text-xs font-semibold text-zinc-400"
                >
                  Hiring / job title search
                </label>
                <input
                  id="contact-finder-job-titles"
                  value={jobTitles}
                  onChange={(event) => setJobTitles(event.target.value)}
                  placeholder="VP Sales, Head of Growth"
                  className={INPUT_CLASS}
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Separate multiple titles with commas.
                </p>
              </div>
              <label className="flex items-center gap-3 self-start pt-7 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={hiring}
                  onChange={(event) => setHiring(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-indigo-500"
                />
                Only search companies currently hiring
              </label>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-400">
                Email type
              </p>
              <div className="inline-flex rounded-lg border border-zinc-800 p-0.5">
                {(
                  [
                    ["personal", "People"],
                    ["generic", "Generic (info@, sales@)"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={type === value}
                    onClick={() => setType(value)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold ${
                      type === value
                        ? "bg-indigo-500/15 text-indigo-200"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <ChipGroup
              label="Seniority"
              options={SENIORITIES}
              value={seniority}
              onChange={setSeniority}
            />
            <ChipGroup
              label="Department"
              options={DEPARTMENTS}
              value={department}
              onChange={setDepartment}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500">
            {mode === "company"
              ? `Each search returns up to ${pageSize} people and uses 1 Hunter search.`
              : "Uses 1 Hunter search, only when an email is found."}
          </p>
          <button
            type="submit"
            disabled={
              busy ||
              outOfSearches ||
              !target.trim() ||
              (mode === "person" && (!firstName.trim() || !lastName.trim()))
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            {mode === "company" ? "Search" : "Find email"}
          </button>
        </div>
      </form>

      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1.5 pr-1 text-xs font-semibold text-zinc-500">
            <History className="h-3.5 w-3.5" /> Recent
          </span>
          {recent.map((entry) => (
            <button
              key={entry.key}
              onClick={() => restoreRecent(entry)}
              title="Reopen these results without spending a Hunter search"
              className="rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:border-indigo-500/40 hover:bg-zinc-900"
            >
              {entry.label}
              <span className="ml-1.5 text-zinc-500">{entry.people.length}</span>
            </button>
          ))}
        </div>
      )}

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <UserSearch className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 font-semibold text-zinc-200">
            {searchMutation.isSuccess || findMutation.isSuccess
              ? "No people found"
              : "Search for a company to see its people"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            Enter a domain like acme.com for the best results. Filter by
            location, hiring, seniority, department, or job title to narrow the
            results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-white">{people.length}</span>
                {total > people.length ? ` of ${total}` : ""} people
                {company ? ` at ${company}` : ""}
              </p>
              {pattern && domain && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  Email format at this company:{" "}
                  <span className="font-semibold text-zinc-300">
                    {pattern}@{domain}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as VerificationFilter)
                }
                aria-label="Filter by verification status"
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-indigo-500/50"
              >
                {VERIFICATION_FILTERS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortByConfidence((current) => !current)}
                aria-pressed={sortByConfidence}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                  sortByConfidence
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
                    : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                Highest confidence
              </button>
              <button
                onClick={() =>
                  setPicked(
                    allSafeSelected
                      ? new Set()
                      : new Set(safeSelectable.map((person) => person.email)),
                  )
                }
                disabled={safeSelectable.length === 0}
                title="Selects everyone shown except invalid or disposable addresses"
                className="px-1 text-xs font-semibold text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
              >
                {allSafeSelected ? "Clear" : "Select all"}
              </button>
              <button
                onClick={() => void verifySelected()}
                disabled={!toVerify.length || Boolean(bulkVerify)}
                title={`Uses ${toVerify.length} Hunter verification${toVerify.length === 1 ? "" : "s"}`}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
              >
                {bulkVerify ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {bulkVerify
                  ? `Verifying ${bulkVerify.done + 1} of ${bulkVerify.total}`
                  : `Verify ${toVerify.length || ""}`}
              </button>
              <button
                onClick={() => setSaving(true)}
                disabled={selectedPeople.length === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Save {selectedPeople.length || ""} to contacts
              </button>
            </div>
          </div>

          {people.some((person) => !person.firstName) && (
            <p className="text-xs text-zinc-500">
              Hunter has no name for some addresses. Add a first name to
              save them.
            </p>
          )}

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full min-w-220 text-left">
              <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="w-10 px-3 py-2" />
                  <th className="px-3 py-2">Person</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Confidence</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Found on</th>
                </tr>
              </thead>
              <tbody>
                {visiblePeople.map((person) => (
                  <PersonRow
                    key={person.email}
                    person={person}
                    names={namesFor(person)}
                    selected={picked.has(person.email)}
                    onToggle={() => togglePicked(person.email)}
                    onNamesChange={(next) =>
                      setNames((prev) => ({ ...prev, [person.email]: next }))
                    }
                    verification={verified[person.email]}
                    onVerify={() => verifyMutation.mutate(person.email)}
                    verifying={
                      verifyMutation.isPending &&
                      verifyMutation.variables === person.email
                    }
                  />
                ))}
                {visiblePeople.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-zinc-500">
                      Nobody matches this status filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {canLoadMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={outOfSearches}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                Load {Math.min(PAGE_SIZE, total - people.length)} more (1
                search)
              </button>
            </div>
          )}
          {lastQuery !== null &&
            people.length < total &&
            accountQuery.isSuccess &&
            isFreePlan && (
              <p className="text-center text-xs text-zinc-500">
                Free Hunter plans return only the first result page. Upgrade
                your Hunter plan to load more.
              </p>
            )}
          {searchMutation.isPending && people.length > 0 && (
            <p className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more…
            </p>
          )}
        </div>
      )}

      {saving && (
        <SaveToContactsModal
          people={selectedPeople.map(toSave)}
          onClose={() => setSaving(false)}
          onDone={(emails) => {
            const saved = new Set(emails);
            setPeople((prev) =>
              prev.map((person) =>
                saved.has(person.email)
                  ? { ...person, alreadyInContacts: true }
                  : person,
              ),
            );
            setPicked(new Set());
            setSaving(false);
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            queryClient.invalidateQueries({
              queryKey: ["contact-directories"],
            });
          }}
        />
      )}
    </div>
  );
}
