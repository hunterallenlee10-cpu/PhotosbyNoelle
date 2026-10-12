import { u } from './url';

export const NAV = [
  { id: 'sports', label: 'Sports', href: u('/sports') },
  { id: 'lifestyle', label: 'Lifestyle', href: u('/lifestyle') },
  { id: 'about', label: 'About', href: u('/about') },
  { id: 'kind-words', label: 'Kind Words', href: u('/kind-words') },
] as const;
