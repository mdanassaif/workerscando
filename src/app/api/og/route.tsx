import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'WorkersCanDo';
    const description = searchParams.get('description') || '100 Tools in 100 Days';
    const status = searchParams.get('status') || 'live';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            padding: '80px',
            fontFamily: 'system-ui, sans-serif',
            backgroundImage: 'linear-gradient(to bottom right, #ffffff 0%, #fff7ed 100%)',
          }}
        >
          {/* Header with logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: '#F97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                <path
                  d="M10 18L14 14L18 18L22 14L26 18"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 22L14 18L18 22L22 18L26 22"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#18181B',
                letterSpacing: '-0.02em',
              }}
            >
              workers<span style={{ color: '#F97316' }}>can</span>do
            </span>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
            {status && (
              <div
                style={{
                  display: 'inline-flex',
                  padding: '8px 20px',
                  backgroundColor: status === 'live' ? '#DCFCE7' : '#FEF3C7',
                  color: status === 'live' ? '#16A34A' : '#CA8A04',
                  borderRadius: '10px',
                  fontSize: '20px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  alignSelf: 'flex-start',
                }}
              >
                {status === 'live' ? '🟢 LIVE' : '🟡 COMING SOON'}
              </div>
            )}
            
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 700,
                color: '#18181B',
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            
            <p
              style={{
                fontSize: '32px',
                color: '#52525B',
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '24px',
              color: '#71717A',
            }}
          >
            <span>⚡</span>
            <span>Powered by Cloudflare Workers</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.log(`Error generating OG image: ${errorMessage}`);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
