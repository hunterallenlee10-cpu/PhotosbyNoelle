// Shared inquiry form definition: used by the page (labels, options) and the API (validation).
export const LOOKING_FOR = ['Sports', 'Team & Athletics', 'Portraits & Lifestyle', 'Event', 'Something else'] as const;
export const WHERE = ['Oahu', 'Virginia', 'Somewhere else'] as const;

export interface Inquiry {
  name: string;
  email: string;
  phone: string;
  lookingFor: string;
  where: string;
  when: string;
  message: string;
  heard: string;
}

export type Errors = Partial<Record<keyof Inquiry, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function parseInquiry(raw: Record<string, unknown>): { data: Inquiry; errors: Errors } {
  const data: Inquiry = {
    name: clean(raw.name, 120),
    email: clean(raw.email, 200),
    phone: clean(raw.phone, 40),
    lookingFor: clean(raw.lookingFor, 40),
    where: clean(raw.where, 40),
    when: clean(raw.when, 120),
    message: String(raw.message ?? '').trim().slice(0, 4000),
    heard: clean(raw.heard, 160),
  };
  const errors: Errors = {};
  if (!data.name) errors.name = 'Please add your name.';
  if (!data.email) errors.email = 'Please add your email so I can reply.';
  else if (!EMAIL.test(data.email)) errors.email = 'That email looks off. Check for a typo?';
  if (data.phone && !/^[0-9+().\-\s]{7,}$/.test(data.phone)) errors.phone = 'Use digits, spaces, or + ( ) - only.';
  if (!LOOKING_FOR.includes(data.lookingFor as (typeof LOOKING_FOR)[number])) errors.lookingFor = 'Pick what you’re looking for.';
  if (data.where && !WHERE.includes(data.where as (typeof WHERE)[number])) errors.where = 'Pick one of the options.';
  if (data.message.length < 10) errors.message = 'Tell me a little more (at least a sentence).';
  return { data, errors };
}
