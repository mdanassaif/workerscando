import {
  Navbar,
  Hero,
  FeaturedProjects,
  WhyWorkers,
  CTA,
} from '@/components';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Navbar />
      <Hero />
      <FeaturedProjects />
      <WhyWorkers />
      <CTA />
    </main>
  );
}