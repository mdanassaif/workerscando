import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components';
import VerifyClient from './VerifyClient';

export const metadata: Metadata = {
    title: 'Verify - Dead Man\'s Switch',
    description: 'Verify your Dead Man\'s Switch check-in',
};

export default function VerifyPage() {
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
                <VerifyClient />
            </Suspense>
            <Footer />
        </main>
    );
}
