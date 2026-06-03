'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { fetchExport, useImport } from '@/lib/hooks';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const doImport = useImport();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ count: number; library: unknown[] } | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function onExport() {
    setBusy(true);
    try {
      const data = await fetchExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shuroku-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    try {
      const parsed = JSON.parse(await file.text());
      const library = Array.isArray(parsed.library) ? parsed.library : [];
      setPreview({ count: library.length, library });
    } catch {
      setResult('That file could not be read as a Shuroku export.');
      setPreview(null);
    }
  }

  function confirmImport() {
    if (!preview) return;
    doImport.mutate(preview.library, {
      onSuccess: (r) => {
        setResult(`Imported ${r.imported}, skipped ${r.skipped}.`);
        setPreview(null);
      },
    });
  }

  const card = 'rounded-lg border border-ink-line bg-ink-850 p-5';

  return (
    <AppShell>
      <h1 className="font-display text-3xl text-washi-50">Settings</h1>
      <p className="mt-1 text-sm text-washi-400">{user?.email}</p>

      <div className="mt-8 flex max-w-xl flex-col gap-4">
        <div className={card}>
          <h2 className="font-display text-lg text-washi-50">Appearance</h2>
          <p className="mt-1 text-sm text-washi-400">Switch between the ink and daylight-washi themes.</p>
          <Button variant="secondary" className="mt-3" onClick={toggle}>
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </Button>
        </div>

        <div className={card}>
          <h2 className="font-display text-lg text-washi-50">Export</h2>
          <p className="mt-1 text-sm text-washi-400">Download your full library and collections as JSON.</p>
          <Button className="mt-3" onClick={onExport} disabled={busy}>
            {busy ? 'Preparing…' : 'Export library'}
          </Button>
        </div>

        <div className={card}>
          <h2 className="font-display text-lg text-washi-50">Import</h2>
          <p className="mt-1 text-sm text-washi-400">
            Restore from a Shuroku export. Titles already in your archive are updated; titles not yet cached are skipped (search them once first).
          </p>
          <label className="mt-3 inline-flex h-10 cursor-pointer items-center rounded-md border border-ink-line px-4 text-sm text-washi-200 hover:bg-ink-800 hover:text-washi-50">
            Choose file
            <input type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
          </label>
          {preview && (
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-sm text-washi-400">{preview.count} entries ready</span>
              <Button onClick={confirmImport} disabled={doImport.isPending}>
                {doImport.isPending ? 'Importing…' : 'Confirm import'}
              </Button>
            </div>
          )}
          {result && <p className="mt-3 font-mono text-xs text-washi-400">{result}</p>}
        </div>
      </div>
    </AppShell>
  );
}
