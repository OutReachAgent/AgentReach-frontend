import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * 1200x630 link-preview card: logo, page eyebrow and title, and a product
 * screenshot from src/assets/og (JPEG, which ImageResponse can render).
 */
export async function shareCard({ eyebrow, title, shot }: { eyebrow: string; title: string; shot: string }) {
  // Literal folders keep build tracing scoped to these two directories.
  const [logoFile, shotFile] = await Promise.all([
    readFile(join(process.cwd(), 'public', 'reachconvert-icon.png')),
    readFile(join(process.cwd(), 'src', 'assets', 'og', `${shot}.jpg`)),
  ]);
  const logo = `data:image/png;base64,${logoFile.toString('base64')}`;
  const screenshot = `data:image/jpeg;base64,${shotFile.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'radial-gradient(circle at 85% 15%, #0b3a52 0%, #060b0d 55%)',
          color: '#f4f7f8',
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={screenshot}
          width={720}
          height={450}
          style={{ position: 'absolute', left: 560, top: 150, borderRadius: 18, border: '2px solid rgba(255,255,255,0.14)' }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 540,
            height: '100%',
            padding: '64px 0 64px 64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={logo} width={64} height={60} />
            <div style={{ fontSize: 36, fontWeight: 700 }}>ReachConvert</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 22, letterSpacing: 3, color: '#38bdf8' }}>{eyebrow}</div>
            <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{title}</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
