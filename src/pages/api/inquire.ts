// POST /api/inquire: the inquiry form. Runs as a Vercel function.
// Delivery: Resend (RESEND_API_KEY + INQUIRY_TO_EMAIL), else Formspree (FORMSPREE_ENDPOINT).
// Spam: honeypot field, a minimum fill time, and a per-IP rate limit.
// Works for fetch (Accept: application/json -> JSON) and plain form posts (303 redirect).
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { parseInquiry, type Inquiry } from '@/lib/inquiry';

export const prerender = false;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>(); // per warm instance: a basic limit, not a guarantee

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function render(d: Inquiry) {
  const rows: [string, string][] = [
    ['Name', d.name],
    ['Email', d.email],
    ['Phone', d.phone || '(not given)'],
    ['Looking for', d.lookingFor],
    ['Where', d.where || '(not given)'],
    ['Date or season', d.when || '(not given)'],
    ['Heard about me', d.heard || '(not given)'],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${d.message}`;
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#555;vertical-align:top"><b>${k}</b></td><td>${esc(v)}</td></tr>`)
    .join('')}</table><p style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-wrap">${esc(d.message)}</p>`;
  return { text, html };
}

async function deliver(d: Inquiry): Promise<{ ok: true } | { ok: false; reason: string }> {
  const subject = `New inquiry: ${d.lookingFor} from ${d.name}`;
  const { text, html } = render(d);
  const key = env('RESEND_API_KEY');
  const to = env('INQUIRY_TO_EMAIL');
  if (key && to) {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: env('INQUIRY_FROM_EMAIL') || 'Photos by Noelle <onboarding@resend.dev>',
      to: to.split(',').map((s) => s.trim()),
      replyTo: d.email,
      subject,
      text,
      html,
    });
    return error ? { ok: false, reason: `resend: ${error.message}` } : { ok: true };
  }
  const formspree = env('FORMSPREE_ENDPOINT');
  if (formspree) {
    const r = await fetch(formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...d, _subject: subject, _replyto: d.email }),
    });
    return r.ok ? { ok: true } : { ok: false, reason: `formspree: ${r.status}` };
  }
  return { ok: false, reason: 'not-configured' };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = (status: number, body: Record<string, unknown>, redirect: string) =>
    wantsJson
      ? new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
      : new Response(null, { status: 303, headers: { Location: redirect } });

  let raw: Record<string, unknown>;
  try {
    raw = (request.headers.get('content-type') ?? '').includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return reply(400, { ok: false, error: 'bad-request' }, '/inquire/problem');
  }

  // Bots fill the hidden field or submit inhumanly fast: accept quietly, send nothing.
  const started = Number(raw.t);
  if (String(raw.company ?? '').trim() || (started && Date.now() - started < 2500)) {
    return reply(200, { ok: true }, '/inquire/thanks');
  }

  const ip = (request.headers.get('x-forwarded-for') ?? clientAddress ?? 'unknown').split(',')[0].trim();
  if (limited(ip)) return reply(429, { ok: false, error: 'rate-limited' }, '/inquire/problem');

  const { data, errors } = parseInquiry(raw);
  if (Object.keys(errors).length) return reply(422, { ok: false, error: 'invalid', errors }, '/inquire/problem');

  try {
    const sent = await deliver(data);
    if (!sent.ok) {
      console.error('[inquire] delivery failed:', sent.reason);
      return reply(sent.reason === 'not-configured' ? 503 : 502, { ok: false, error: sent.reason === 'not-configured' ? 'not-configured' : 'delivery' }, '/inquire/problem');
    }
  } catch (e) {
    console.error('[inquire] delivery error:', e);
    return reply(502, { ok: false, error: 'delivery' }, '/inquire/problem');
  }
  return reply(200, { ok: true }, '/inquire/thanks');
};

export const ALL: APIRoute = () => new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
