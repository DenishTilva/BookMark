import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex w-full max-w-md flex-col items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              Smart Bookmark App
            </h1>
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
