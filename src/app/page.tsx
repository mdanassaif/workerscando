import { Navbar, Hero, FeaturedProjects, WhyWorkers, CTA, Footer } from '@/components';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedProjects />
      <WhyWorkers />
      <CTA />
      <Footer />
    </main>
  );
}