'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

type Bookmark = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};

interface BookmarkListProps {
  bookmarks: Bookmark[];
  userId: string;
  onBookmarkDeleted?: (id: string) => void;
}

export default function BookmarkList({
  bookmarks,
  userId,
  onBookmarkDeleted,
}: BookmarkListProps) {
  const [localBookmarks, setLocalBookmarks] = useState<Bookmark[]>(bookmarks);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');

  // Sync with parent bookmarks
  useEffect(() => {
    setLocalBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    console.log('=== BookmarkList useEffect starting ===', { userId });
    const supabase = createClient();

    console.log('Creating Realtime channel for user:', userId);

    // Create a simple broadcast channel to test if realtime is working
    const channel = supabase
      .channel(`bookmarks:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to ALL events
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          console.log('=== Realtime ANY event received ===', payload);
          console.log('Event type:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark;
            console.log('New bookmark user_id:', newBookmark.user_id, 'Expected:', userId);
            if (newBookmark.user_id !== userId) {
              console.log('Skipping - wrong user');
              return;
            }
            console.log('Adding bookmark to list');
            setLocalBookmarks((current) => {
              const exists = current.some((b) => b.id === newBookmark.id);
              if (exists) {
                console.log('Bookmark already exists, skipping');
                return current;
              }
              console.log('Bookmark added to list');
              return [newBookmark, ...current];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id as string;
            console.log('Deleted ID:', deletedId);
            if (!deletedId) return;
            setLocalBookmarks((current) =>
              current.filter((b) => b.id !== deletedId),
            );
          }
        },
      )
      .subscribe((state) => {
        console.log('=== Realtime subscription state ===', state);
        setStatus(state === 'SUBSCRIBED' ? 'Connected' : state);
      });

    // Polling fallback - sync every 3 seconds
    const pollInterval = setInterval(async () => {
      console.log('=== Polling for updates ===');
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setLocalBookmarks((current) => {
          // Only update if different
          const currentIds = current.map(b => b.id).sort().join(',');
          const newIds = data.map((b: Bookmark) => b.id).sort().join(',');
          if (currentIds !== newIds) {
            console.log('=== Polling found changes, updating ===');
            return data;
          }
          return current;
        });
      }
    }, 3000);

    return () => {
      console.log('=== Removing Realtime channel ===');
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    // Optimistic update: remove from UI immediately
    setLocalBookmarks((current) => current.filter((b) => b.id !== id));
    // Notify parent
    onBookmarkDeleted?.(id);

    const supabase = createClient();
    try {
      await supabase.from('bookmarks').delete().eq('id', id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId((currentId) => (currentId === id ? null : currentId));
    }
  };

  return (
    <div>
      <p className="mb-2 text-xs text-muted">Realtime: {status}</p>
      {localBookmarks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-gray-50 px-4 py-6 text-center text-sm text-muted">
          No bookmarks yet. Add your first one!
        </p>
      ) : (
        <ul className="space-y-3">
          {localBookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white px-4 py-3 text-sm shadow-sm"
            >
              <div className="min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-1 font-medium text-gray-900 hover:underline"
                >
                  {bookmark.title}
                </a>
                <p className="mt-1 line-clamp-1 text-xs text-muted">
                  {bookmark.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs text-muted transition hover:border-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Delete bookmark"
              >
                {deletingId === bookmark.id ? (
                  <span className="text-[10px]">…</span>
                ) : (
                  <span aria-hidden="true">&times;</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

