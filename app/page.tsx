import { redirect } from 'next/navigation';
import { createServerClientInstance } from '../lib/supabase/server';

export default async function HomePage() {
  const supabase = createServerClientInstance();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  redirect('/login');
}

