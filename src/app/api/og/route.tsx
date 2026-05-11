import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const THEMES = {
  midnight: { bg: '#0a0a14', surface: '#12121f', text: '#ffffff', muted: '#7c7c9e', accent: '#6366f1', accentSoft: 'rgba(99,102,241,0.15)', line: '#1e1e35' },
  sunset:   { bg: '#0f0805', surface: '#1c0f08', text: '#ffffff', muted: '#b07050', accent: '#f97316', accentSoft: 'rgba(249,115,22,0.15)',  line: '#2e1508' },
  ocean:    { bg: '#030d18', surface: '#061828', text: '#ffffff', muted: '#4e8ab0', accent: '#06b6d4', accentSoft: 'rgba(6,182,212,0.15)',    line: '#0a2540' },
  forest:   { bg: '#030c05', surface: '#071510', text: '#ffffff', muted: '#4a8055', accent: '#22c55e', accentSoft: 'rgba(34,197,94,0.15)',    line: '#0b2010' },
  minimal:  { bg: '#ffffff', surface: '#f4f4f5', text: '#09090b', muted: '#71717a', accent: '#18181b', accentSoft: 'rgba(24,24,27,0.07)',     line: '#e4e4e7' },
  rose:     { bg: '#0e0508', surface: '#1a0810', text: '#ffffff', muted: '#b05080', accent: '#f43f5e', accentSoft: 'rgba(244,63,94,0.15)',    line: '#2a0c18' },
} as const;

type ThemeName = keyof typeof THEMES;
type Layout = 'standard' | 'centered' | 'split' | 'minimal' | 'bold';

function clamp(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const title    = clamp(sp.get('title')    ?? 'WorkersCanDo',         52);
  const subtitle = clamp(sp.get('subtitle') ?? sp.get('description') ?? '', 90);
  const author   = sp.get('author')   ?? '';
  const domain   = sp.get('domain')   ?? 'workerscando.com';
  const emoji    = sp.get('emoji')    ?? '';
  const date     = sp.get('date')     ?? '';
  const status   = sp.get('status')   ?? '';
  const themeName = (sp.get('theme')  ?? 'midnight') as ThemeName;
  const pageLayout = (sp.get('layout') ?? 'standard') as Layout;

  const t = THEMES[themeName] ?? THEMES.midnight;
  const isLight = themeName === 'minimal';

  // Shared brand mark
  const Brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: t.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 128 128">
          <path fill={isLight ? '#fff' : '#fff'} d="M33.9 9.7l14.6 26.4L35.1 60.2a7.75 7.75 0 000 7.5l13.4 24.2-14.6 26.4a15.5 15.5 0 01-6.6-6.2L4.1 71.7a15.6 15.6 0 010-15.5l23.3-40.4a15.5 15.5 0 016.5-6.1z"/>
          <path fill={isLight ? '#fff' : '#fff'} d="M100.7 15.8l23.2 40.4a15.5 15.5 0 010 15.5L100.7 112a15.5 15.5 0 01-13.4 7.8H64l28.9-52.1a7.75 7.75 0 000-7.5L64 8.1h23.3a15.5 15.5 0 0113.4 7.7z"/>
        </svg>
      </div>
      <span style={{ color: t.text, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', opacity: 0.85 }}>
        workerscando
      </span>
    </div>
  );

  const StatusPill = status ? (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: status === 'live' ? 'rgba(34,197,94,0.14)' : t.accentSoft,
      border: `1px solid ${status === 'live' ? 'rgba(34,197,94,0.30)' : t.accent + '40'}`,
      borderRadius: 999, padding: '5px 14px',
    }}>
      {status === 'live' && (
        <div style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e', display: 'flex' }} />
      )}
      <span style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: status === 'live' ? '#22c55e' : t.muted,
      }}>
        {status === 'live' ? 'Live' : 'Soon'}
      </span>
    </div>
  ) : null;

  // ── SPLIT layout ──────────────────────────────────────────────────
  if (pageLayout === 'split') {
    return new ImageResponse((
      <div style={{ width: 1200, height: 630, display: 'flex', background: t.bg, fontFamily: 'system-ui, sans-serif' }}>
        {/* Left panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 64px', borderRight: `1px solid ${t.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {Brand}
            {StatusPill}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: t.text, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 20, color: t.muted, lineHeight: 1.5, maxWidth: 480 }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {author && <span style={{ fontSize: 15, fontWeight: 600, color: t.text, opacity: 0.7 }}>{author}</span>}
            {author && domain && <span style={{ color: t.line, fontSize: 15 }}>·</span>}
            {domain && <span style={{ fontSize: 15, color: t.muted }}>{domain}</span>}
            {date && <span style={{ fontSize: 14, color: t.muted, marginLeft: 'auto' }}>{date}</span>}
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          width: 360, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(160deg, ${t.surface} 0%, ${t.bg} 100%)`,
          position: 'relative',
        }}>
          {/* Glow orb */}
          <div style={{
            position: 'absolute', width: 240, height: 240, borderRadius: 120,
            background: `radial-gradient(circle, ${t.accent}30 0%, transparent 70%)`,
            display: 'flex',
          }} />
          {/* Accent ring */}
          <div style={{
            position: 'absolute', width: 200, height: 200, borderRadius: 100,
            border: `1px solid ${t.accent}25`, display: 'flex',
          }} />
          <div style={{
            position: 'absolute', width: 280, height: 280, borderRadius: 140,
            border: `1px solid ${t.line}`, display: 'flex',
          }} />
          {/* Emoji or accent mark */}
          {emoji ? (
            <div style={{ fontSize: 96, lineHeight: 1, zIndex: 1, display: 'flex' }}>{emoji}</div>
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: 20, background: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}>
              <svg width="44" height="44" viewBox="0 0 128 128">
                <path fill="#fff" d="M33.9 9.7l14.6 26.4L35.1 60.2a7.75 7.75 0 000 7.5l13.4 24.2-14.6 26.4a15.5 15.5 0 01-6.6-6.2L4.1 71.7a15.6 15.6 0 010-15.5l23.3-40.4a15.5 15.5 0 016.5-6.1z"/>
                <path fill="#fff" d="M100.7 15.8l23.2 40.4a15.5 15.5 0 010 15.5L100.7 112a15.5 15.5 0 01-13.4 7.8H64l28.9-52.1a7.75 7.75 0 000-7.5L64 8.1h23.3a15.5 15.5 0 0113.4 7.7z"/>
              </svg>
            </div>
          )}
          {/* Corner domain */}
          <div style={{ position: 'absolute', bottom: 28, display: 'flex' }}>
            <span style={{ fontSize: 12, color: t.muted, letterSpacing: '0.04em' }}>workerscando.com</span>
          </div>
        </div>
      </div>
    ), { width: 1200, height: 630 });
  }

  // ── CENTERED layout ───────────────────────────────────────────────
  if (pageLayout === 'centered') {
    return new ImageResponse((
      <div style={{ width: 1200, height: 630, display: 'flex', background: t.bg, fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          backgroundImage: `radial-gradient(${t.line} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, position: 'relative', padding: '0 100px' }}>
          {emoji && <div style={{ fontSize: 72, display: 'flex', lineHeight: 1 }}>{emoji}</div>}
          <div style={{ fontSize: 64, fontWeight: 800, color: t.text, letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center' }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 22, color: t.muted, lineHeight: 1.5, textAlign: 'center', maxWidth: 640 }}>{subtitle}</div>}
          {StatusPill && <div style={{ display: 'flex', marginTop: 8 }}>{StatusPill}</div>}
        </div>
        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
          borderTop: `1px solid ${t.line}`, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', padding: '0 60px',
          background: t.surface,
        }}>
          {Brand}
          <span style={{ fontSize: 13, color: t.muted }}>
            {[author, domain, date].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
    ), { width: 1200, height: 630 });
  }

  // ── BOLD layout ────────────────────────────────────────────────────
  if (pageLayout === 'bold') {
    return new ImageResponse((
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: t.bg, fontFamily: 'system-ui, sans-serif', padding: '64px 80px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {Brand}
          {StatusPill ?? <span style={{ fontSize: 14, color: t.muted }}>{date}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {emoji && <div style={{ fontSize: 52, display: 'flex', marginBottom: 12 }}>{emoji}</div>}
          <div style={{ fontSize: 80, fontWeight: 900, color: t.text, letterSpacing: '-0.05em', lineHeight: 1, display: 'flex', flexWrap: 'wrap' }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 26, color: t.muted, marginTop: 16, lineHeight: 1.45 }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 3, background: t.accent, borderRadius: 2, display: 'flex' }} />
          <span style={{ fontSize: 15, color: t.muted, flexShrink: 0 }}>
            {[author, domain].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
    ), { width: 1200, height: 630 });
  }

  // ── MINIMAL layout ─────────────────────────────────────────────────
  if (pageLayout === 'minimal') {
    const minTheme = THEMES.minimal;
    return new ImageResponse((
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: minTheme.bg, fontFamily: 'system-ui, sans-serif', padding: '72px 96px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>{Brand}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {emoji && <div style={{ fontSize: 52, display: 'flex' }}>{emoji}</div>}
          <div style={{ fontSize: 62, fontWeight: 700, color: minTheme.text, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 22, color: minTheme.muted, lineHeight: 1.55 }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, color: minTheme.muted }}>
            {[author, domain].filter(Boolean).join(' · ')}
          </span>
          {StatusPill}
        </div>
      </div>
    ), { width: 1200, height: 630 });
  }

  // ── STANDARD (default) layout ──────────────────────────────────────
  return new ImageResponse((
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: t.bg, fontFamily: 'system-ui, sans-serif', padding: '56px 72px', justifyContent: 'space-between', position: 'relative' }}>
      {/* Accent stripe top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${t.accent}, ${t.accent}60, transparent)`, display: 'flex' }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Brand}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {StatusPill}
          {date && <span style={{ fontSize: 14, color: t.muted }}>{date}</span>}
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {emoji && <div style={{ fontSize: 52, display: 'flex', marginBottom: 4 }}>{emoji}</div>}
        <div style={{ fontSize: 62, fontWeight: 800, color: t.text, letterSpacing: '-0.04em', lineHeight: 1.08 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 22, color: t.muted, lineHeight: 1.55, maxWidth: 760 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {author && <span style={{ fontSize: 16, fontWeight: 600, color: t.text, opacity: 0.75 }}>{author}</span>}
          {author && domain && <span style={{ color: t.line, fontSize: 16 }}>·</span>}
          {domain && <span style={{ fontSize: 16, color: t.muted }}>{domain}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: t.accent, display: 'flex' }} />
          <span style={{ fontSize: 14, color: t.muted }}>workerscando.com</span>
        </div>
      </div>
    </div>
  ), { width: 1200, height: 630 });
}
