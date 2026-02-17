'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '../lib/supabase/client';

interface BookmarkFormProps {
  userId: string;
  onBookmarkAdded?: (bookmark: { id: string; user_id: string; title: string; url: string; created_at: string }) => void;
}

export default function BookmarkForm({ userId, onBookmarkAdded }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      // Basic URL validation
      const parsedUrl = new URL(url);
      if (!parsedUrl.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol.');
      }
    } catch {
      setError('Please enter a valid URL (including http/https).');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          title: title.trim(),
          url: url.trim(),
          user_id: userId,
        })
        .select()
        .single();

      if (insertError) {
        setError('Unable to add bookmark. Please try again.');
        return;
      }

      // Optimistic update: notify parent to add to list immediately
      if (data && onBookmarkAdded) {
        onBookmarkAdded(data);
      }

      setTitle('');
      setUrl('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-gray-50 p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Bookmark title"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        <input
          type="url"
          name="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="text-xs font-medium text-red-600" aria-live="polite">
          {error}
        </p>
      )}
    </form>
  );
}

