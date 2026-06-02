import { useState } from 'react';
import { User, Lock, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { name: profile.name, currency: profile.currency });
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const Section = ({ icon, title, children }) => (
    <div className="card">
      <div className="mb-5 flex items-center gap-3 border-b border-surface-border pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-400/10 text-navy-400">
          {icon}
        </div>
        <h2 className="font-semibold text-[#e2eaf6]">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#e2eaf6]">Settings</h1>
        <p className="text-sm text-[#7b9ab2]">Manage your account preferences</p>
      </div>

      <Section icon={<User className="h-4 w-4" />} title="Profile">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" value={user?.email || ''} className="input opacity-50 cursor-not-allowed" disabled />
            <p className="mt-1 text-xs text-[#7b9ab2]">Email cannot be changed.</p>
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : 'Save profile'}
          </button>
        </form>
      </Section>

      <Section icon={<Globe className="h-4 w-4" />} title="Preferences">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Currency</label>
            <select
              value={profile.currency}
              onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))}
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : 'Save preferences'}
          </button>
        </form>
      </Section>

      <Section icon={<Lock className="h-4 w-4" />} title="Change Password">
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              className="input"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="Min. 6 characters"
              className="input"
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              className="input"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showpw"
              checked={showPw}
              onChange={(e) => setShowPw(e.target.checked)}
              className="rounded border-surface-border"
            />
            <label htmlFor="showpw" className="text-sm text-[#7b9ab2] cursor-pointer">Show passwords</label>
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : 'Change password'}
          </button>
        </form>
      </Section>

      <div className="card border-rose-500/10">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="font-semibold text-[#e2eaf6]">Account info</h3>
        </div>
        <p className="text-sm text-[#7b9ab2]">
          Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
        </p>
      </div>
    </div>
  );
}
