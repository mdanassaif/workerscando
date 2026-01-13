"use client";

import React, { useState } from 'react';
import { Navbar, Footer } from '@/components';

interface DocItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function DocsClient() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const docSections: DocItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>
            Getting Started
          </h2>
          <p style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8, marginBottom: '24px' }}>
            Welcome to WorkersCanDo! This documentation will help you understand how to use our tools 
            and potentially contribute your own.
          </p>
          
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            What is WorkersCanDo?
          </h3>
          <p style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8, marginBottom: '24px' }}>
            WorkersCanDo is a collection of 100 micro-tools built on Cloudflare Workers. 
            Each tool is designed to be fast, focused, and free to use.
          </p>

          <div style={{
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <p style={{ fontSize: '14px', color: '#EA580C', fontWeight: 500 }}>
              💡 All tools are deployed at the edge and respond in milliseconds from 300+ locations worldwide.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'url-metadata-api',
      title: 'URL Metadata API',
      content: (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>
            URL Metadata API
          </h2>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: '#DCFCE7',
            color: '#16A34A',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            LIVE
          </span>
          
          <p style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8, marginBottom: '24px' }}>
            Extract metadata from any URL instantly. Get title, description, Open Graph tags, 
            favicons, and more.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            Endpoint
          </h3>
          <div style={{
            background: '#18181B',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontFamily: "var(--font-mono)",
            fontSize: '14px',
            color: '#22C55E',
            overflowX: 'auto'
          }}>
            GET https://url-metadata-api.brogee9o9.workers.dev/?url=YOUR_URL
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            Example
          </h3>
          <div style={{
            background: '#18181B',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontFamily: "var(--font-mono)",
            fontSize: '13px',
            color: '#E5E5E5',
            overflowX: 'auto'
          }}>
            <pre style={{ margin: 0 }}>{`curl "https://url-metadata-api.brogee9o9.workers.dev/?url=https://example.com"`}</pre>
          </div>

          <div style={{
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#EA580C', fontWeight: 500 }}>
              📖 More documentation coming soon...
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'og-image-generator',
      title: 'Dynamic OG Images',
      content: (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>
            Dynamic OG Images
          </h2>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: '#DCFCE7',
            color: '#16A34A',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            LIVE
          </span>
          
          <p style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8, marginBottom: '24px' }}>
            Generate beautiful Open Graph images on the fly. Perfect for blogs, social sharing, 
            and dynamic content.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            Endpoint
          </h3>
          <div style={{
            background: '#18181B',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontFamily: "var(--font-mono)",
            fontSize: '14px',
            color: '#22C55E',
            overflowX: 'auto'
          }}>
            GET https://og-image-generator.brogee9o9.workers.dev/
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            Parameters
          </h3>
          <div style={{
            background: '#FAFAFA',
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#F4F4F5' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#18181B' }}>Parameter</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#18181B' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid #E5E5E5' }}>
                  <td style={{ padding: '12px 16px', fontFamily: "var(--font-mono)", color: '#F97316' }}>title</td>
                  <td style={{ padding: '12px 16px', color: '#52525B' }}>The main title text</td>
                </tr>
                <tr style={{ borderTop: '1px solid #E5E5E5' }}>
                  <td style={{ padding: '12px 16px', fontFamily: "var(--font-mono)", color: '#F97316' }}>subtitle</td>
                  <td style={{ padding: '12px 16px', color: '#52525B' }}>Optional subtitle text</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#EA580C', fontWeight: 500 }}>
              📖 More documentation coming soon...
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'contributing',
      title: 'Contributing',
      content: (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>
            Contributing
          </h2>
          <p style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8, marginBottom: '24px' }}>
            Want to suggest a tool or contribute to the project? Here&apos;s how you can help.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            Suggest a Tool
          </h3>
          <p style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8, marginBottom: '24px' }}>
            Have an idea for a useful micro-tool? Open an issue on GitHub with your suggestion. 
            Include what problem it solves and a brief description of how it should work.
          </p>

          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#18181B', marginBottom: '12px' }}>
            Guidelines
          </h3>
          <ul style={{ fontSize: '16px', color: '#52525B', lineHeight: 2, marginBottom: '24px', paddingLeft: '24px' }}>
            <li>Tools should be small and focused on one task</li>
            <li>Must be deployable on Cloudflare Workers</li>
            <li>Should be useful to developers or general users</li>
            <li>Free to use with no authentication required</li>
          </ul>

          <div style={{
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#EA580C', fontWeight: 500 }}>
              🚧 Contribution guidelines coming soon...
            </p>
          </div>
        </div>
      )
    }
  ];

  const activeDoc = docSections.find(s => s.id === activeSection);

  return (
    <main>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar: always visible on all screens */}
        <aside
          style={{
            width: '220px',
            borderRight: '1px solid #E5E5E5',
            background: 'white',
            padding: '24px 0',
            minHeight: '100%',
            position: 'relative',
            zIndex: 2,
          }}
          className="doc-sidebar"
        >
          <div style={{ padding: '0 18px', marginBottom: '18px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Documentation
            </span>
          </div>
          <nav>
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 18px',
                  textAlign: 'left',
                  background: activeSection === section.id ? '#FFF7ED' : 'transparent',
                  border: 'none',
                  borderLeft: activeSection === section.id ? '3px solid #F97316' : '3px solid transparent',
                  color: activeSection === section.id ? '#F97316' : '#52525B',
                  fontSize: '14px',
                  fontWeight: activeSection === section.id ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>
        {/* Content */}
        <div style={{ flex: 1, padding: '32px 18px', maxWidth: '900px', margin: '0 auto' }} className="doc-content">
          {activeDoc?.content}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 900px) {
          .doc-content {
            max-width: 100vw;
          }
        }
        @media (max-width: 768px) {
          .doc-sidebar {
            width: 100vw;
            border-right: none;
            border-bottom: 1px solid #E5E5E5;
            padding: 12px 0;
            min-height: auto;
          }
          .doc-content {
            padding: 18px 8px !important;
          }
        }
        @media (max-width: 480px) {
          .doc-content {
            padding: 10px 4px !important;
          }
        }
      `}</style>
      <Footer />
    </main>
  );
}
