'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialDisplayName: string | null;
  initialBio: string | null;
}

export function ProfileForm({ initialDisplayName, initialBio }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName || '');
  const [bio, setBio] = useState(initialBio || '');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          bio,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Display Name</h2>
          <p className="text-lg">{displayName || 'Not set'}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Bio</h2>
          <p className="text-lg whitespace-pre-wrap">{bio || 'No bio yet'}</p>
        </div>
        <Button onClick={() => setIsEditing(true)} variant="outline">
          Edit Profile
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Display Name
        </label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Bio
        </label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          rows={4}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          {bio.length}/200 characters
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setDisplayName(initialDisplayName || '');
            setBio(initialBio || '');
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
} 