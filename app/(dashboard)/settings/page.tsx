'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();

  // ── Profile ──────────────────────────────────────────────────────────────────
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name ?? '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsProfileLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to save profile');
      }

      await update({ name: data.user.name });

      toast({ title: 'Profile updated', description: 'Your name has been saved.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // ── Change Password ──────────────────────────────────────────────────────────
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'New password must be at least 8 characters.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'New password and confirmation must be the same.',
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to change password');
      }

      toast({ title: 'Password changed', description: 'Your password has been updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // ── Delete Account ───────────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');

  // Delete is confirmed when the user has supplied either a password
  // (credentials accounts) or typed the exact confirmation phrase (OAuth accounts).
  const isDeleteConfirmValid =
    deletePassword.length > 0 || deletePhrase === 'DELETE MY ACCOUNT';

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleteLoading(true);

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPassword: deletePassword || undefined,
          confirmPhrase: deletePhrase || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to delete account');
      }

      toast({ title: 'Account deleted', description: 'Your account has been removed.' });

      // Sign out and redirect to home — session is now invalid
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isProfileLoading}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email ?? ''}
                disabled
                className="cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>
            <Button type="submit" disabled={isProfileLoading}>
              {isProfileLoading ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password. If you signed up with Google or GitHub, use the forgot-password
            flow to set a password instead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isPasswordLoading}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={isPasswordLoading}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={isPasswordLoading}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </div>
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? 'Updating…' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Danger Zone ──────────────────────────────────────────────────────── */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-sm text-destructive font-medium">
                This will permanently delete your account, all configurations, and cancel any
                active subscription.
              </p>

              {/* Credentials users confirm with their password */}
              <div className="space-y-2">
                <Label htmlFor="deletePassword">
                  Enter your password to confirm{' '}
                  <span className="text-muted-foreground font-normal">
                    (or skip if you use social login)
                  </span>
                </Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeleteLoading}
                  autoComplete="current-password"
                  placeholder="Your current password"
                />
              </div>

              {/* OAuth users confirm with a typed phrase */}
              <div className="space-y-2">
                <Label htmlFor="deletePhrase">
                  Or type{' '}
                  <span className="font-mono text-destructive">DELETE MY ACCOUNT</span>{' '}
                  to confirm
                </Label>
                <Input
                  id="deletePhrase"
                  value={deletePhrase}
                  onChange={(e) => setDeletePhrase(e.target.value)}
                  disabled={isDeleteLoading}
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleteLoading || !isDeleteConfirmValid}
                >
                  {isDeleteLoading ? 'Deleting…' : 'Permanently Delete Account'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeletePhrase('');
                  }}
                  disabled={isDeleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
