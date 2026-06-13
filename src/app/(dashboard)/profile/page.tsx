'use client';

import { api } from '@/lib/api';
import { applyTheme, getStoredUser, LocalUserProfile, saveStoredUser } from '@/lib/localAuth';
import { useOutreachStore } from '@/store/useOutreachStore';
import { Mail, Moon, Save, Sun, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { showAlert } = useOutreachStore();
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setProfile(getStoredUser());
  }, []);

  const updateProfile = (key: keyof LocalUserProfile, value: string) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (!profile) return;

    if (!profile.email.trim() || !profile.name.trim()) {
      showAlert('Name and email are required.', 'error');
      return;
    }

    const nextProfile = {
      ...profile,
      email: profile.email.trim(),
      name: profile.name.trim(),
      initials: profile.initials.trim().slice(0, 3).toUpperCase() || 'OA',
    };

    api.auth.updateProfile({
      ...nextProfile,
      ...(password ? { password } : {}),
    })
      .then((updatedProfile) => {
        saveStoredUser(updatedProfile);
        applyTheme(updatedProfile.theme);
        setProfile(updatedProfile);
        setPassword('');
        showAlert('Profile updated successfully.', 'success');
      })
      .catch((error: Error) => {
        showAlert(error.message || 'Failed to update profile.', 'error');
      });
  };

  if (!profile) {
    return <div className="text-sm text-zinc-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-zinc-900 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
            <UserRound className="h-8 w-8 text-indigo-400" />
            User Profile
          </h2>
          <p className="mt-1 text-sm text-zinc-400">Manage your account identity and workspace appearance.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <section className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 shadow-xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-2xl font-black text-white shadow-lg shadow-indigo-500/20">
            {profile.initials}
          </div>
          <div className="mt-5 text-center">
            <h3 className="text-lg font-bold text-white">{profile.name}</h3>
            <p className="mt-1 text-xs text-zinc-500">{profile.email}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => updateProfile('theme', 'dark')}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                profile.theme === 'dark' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </button>
            <button
              type="button"
              onClick={() => updateProfile('theme', 'light')}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                profile.theme === 'light' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProfileField label="Full Name" value={profile.name} onChange={(value) => updateProfile('name', value)} />
            <ProfileField label="Initials" value={profile.initials} onChange={(value) => updateProfile('initials', value)} />
            <ProfileField label="Email" type="email" value={profile.email} onChange={(value) => updateProfile('email', value)} />
            <ProfileField label="Phone" value={profile.phone} onChange={(value) => updateProfile('phone', value)} />
            <ProfileField label="Title" value={profile.title} onChange={(value) => updateProfile('title', value)} />
            <ProfileField label="Company" value={profile.company} onChange={(value) => updateProfile('company', value)} />
            <ProfileField
              label="New Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="mt-6 flex justify-end border-t border-zinc-850 pt-5">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
            >
              <Save className="h-3.5 w-3.5" />
              Save Profile
            </button>
          </div>
        </section>
      </form>

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-4 text-xs text-zinc-500">
        <Mail className="h-4 w-4 text-zinc-500" />
        Password reset uses the account email saved in this profile.
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50"
      />
    </label>
  );
}
