// Typographic poster fallback for anime with no cover art.
// Deterministic palette + glyph derived from the title, matching the
// prototype's "Ink & Vermillion" placeholder look.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function posterFallback(title: string): { base: string; acc: string; glyph: string } {
  const h = hash(title) % 360;
  const base = `hsl(${h} 28% 12%)`;
  const acc = `hsl(${h} 42% 46%)`;
  // Prefer a CJK character if the title has one, else first alphanumeric, else 収.
  const cjk = title.match(/[\u3000-\u9fff]/);
  const alnum = title.match(/[A-Za-z0-9]/);
  const glyph = cjk ? cjk[0] : alnum ? alnum[0].toUpperCase() : '収';
  return { base, acc, glyph };
}
