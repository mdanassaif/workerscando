export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  tag: string;
  status: 'live' | 'coming';
  day: number;
  url?: string;
  github?: string;
}

export interface Stat {
  number: string;
  label: string;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface DocSection {
  title: string;
  slug: string;
  content?: string;
}