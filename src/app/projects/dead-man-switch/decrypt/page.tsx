import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components';
import DecryptClient from './DecryptClient';

export const metadata: Metadata = {
    title: 'Secret Revealed - Dead Man\'s Switch',
    description: 'View the secret that has been released to you',
};

export default function DecryptPage() {
    return (
        <main>
            <Navbar />
            <Suspense fallback={
                <div style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <p>Loading...</p>
                </div>
            }>
                <DecryptClient />
            </Suspense>
            <Footer />
        </main>
    );
}
