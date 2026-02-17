'use client';

import { useState, useCallback } from 'react';
import BookmarkList from './BookmarkList';
import BookmarkForm from './BookmarkForm';

type Bookmark = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};

interface DashboardClientProps {
  initialBookmarks: Bookmark[];
  userId: string;
  userEmail: string | undefined;
}

export default function DashboardClient({
  initialBookmarks,
  userId,
  userEmail,
}: DashboardClientProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

  const handleBookmarkAdded = useCallback((newBookmark: Bookmark) => {
    setBookmarks((current) => [newBookmark, ...current]);
  }, []);

  const handleBookmarkDeleted = useCallback((id: string) => {
    setBookmarks((current) => current.filter((b) => b.id !== id));
  }, []);

  return (
    <>
      <section className="mb-6">
        <BookmarkForm userId={userId} onBookmarkAdded={handleBookmarkAdded} />
      </section>

      <section>
        <BookmarkList
          bookmarks={bookmarks}
          userId={userId}
          onBookmarkDeleted={handleBookmarkDeleted}
        />
      </section>
    </>
  );
}
