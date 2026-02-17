import { redirect } from 'next/navigation';
import { createServerClientInstance } from '../../lib/supabase/server';
import DashboardClient from '../../components/DashboardClient';
import LogoutButton from '../../components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createServerClientInstance();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;

  let bookmarks = [];
  let fetchError = null;
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      fetchError = error.message;
    } else {
      bookmarks = data || [];
    }
  } catch (err) {
    console.error('Exception fetching bookmarks:', err);
    fetchError = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <main className="w-full max-w-2xl rounded-xl border border-border bg-white p-6 shadow-sm">
      <header className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold">Smart Bookmark App</h1>
          <p className="text-xs text-muted">
            Manage your bookmarks with real-time sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-foreground">
              {user.email ?? 'Signed in'}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {fetchError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Error loading bookmarks: {fetchError}
        </div>
      )}

      <DashboardClient
        initialBookmarks={bookmarks}
        userId={user.id}
        userEmail={user.email}
      />
    </main>
  );
}
