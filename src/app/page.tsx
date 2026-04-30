import { Navbar, Hero, Footer } from '@/components';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}