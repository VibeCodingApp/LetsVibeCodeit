import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const sourceDir = resolve(process.argv[2] || 'D:/Work/vibelist/apps');
const targetDir = resolve(process.argv[3] || 'data/apps');

const domainOverrides = {
  airtable: 'airtable.com',
  calendly: 'calendly.com',
  chatgpt: 'chatgpt.com',
  'github-copilot': 'github.com',
  granola: 'granola.ai',
  linktree: 'linktr.ee',
  'testimonial-to': 'testimonial.to',
  getwaitlist: 'getwaitlist.com',
  qr: 'qrtiger.com',
  shots: 'shots.so',
  uptime: 'betterstack.com',
};

const slugAliases = { linktree: 'linktree-pro' };

function clean(value = '') {
  let result = value.replace(/\r/g, '').trim();
  const replacements = [['ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â·', 'Ãƒâ€šÃ‚Â·'], ['ÃƒÆ’Ã¢â‚¬Å¡ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â', 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'], ['ÃƒÆ’Ã¢â‚¬Å¡ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“', 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“'], ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â', 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â€'], ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢', 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢'], ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â', 'ÃƒÂ¢Ã¢â‚¬Â Ã‚Â'], ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“', 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Ëœ'], ['ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ', 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“'], ['ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ', 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“'], ['ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢', 'ÃƒÆ’Ã¢â‚¬â€'], ['ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¨', 'ÃƒÂ¢Ã…â€œÃ‚Â¦']];
  for (const [from, to] of replacements) result = result.replaceAll(from, to);
  if (result.includes('ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸')) result = Buffer.from(result, 'latin1').toString('utf8');
  return result.trim();
}

function section(markdown, heading) {
  const match = markdown.match(new RegExp(`^##\\s+(?:${heading})[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'im'));
  return clean(match?.[1] || '');
}

function field(markdown, label) {
  const match = markdown.match(new RegExp(`^\\|\\s*(?:${label})[^|]*\\|\\s*([^|\\n]+)`, 'im'));
  return clean(match?.[1] || '');
}

function bullets(value) {
return value.split(/\r?\n/).map(line => line.match(/^\s*-\s+(.+)$/)?.[1]).filter(Boolean).map(clean);
}

function links(value) {
  return [...value.matchAll(/-\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(match => ({
    name: clean(match[1]).replace(/\s+[^\s]+\s+\u00b7.*$/u, ''),
    url: match[2],
    desc: clean(match[1]),
  }));
}

function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function categorySlug(value) {
  const noEmoji = value.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ');
  return slugify(noEmoji) || 'uncategorized';
}

function promptFrom(markdown) {
  const promptSection = markdown.slice(markdown.search(/^##\s+THE PROMPT/im));
  const fenced = promptSection.match(/```\s*([\s\S]*?)```/);
  if (fenced?.[1]) return clean(fenced[1]);
  const bodyEnd = promptSection.search(/^##\s+(?:PRIOR ART|ALSO ONE-SHOTTABLE|Botones de la p)/im);
  const body = promptSection.slice(0, bodyEnd >= 0 ? bodyEnd : promptSection.length);
  const lines = body.split(/\r?\n/);
  const buttonEnd = lines.findIndex(line => /open in Cursor/i.test(line));
return clean(lines.slice(buttonEnd >= 0 ? buttonEnd + 1 : 1).join('\n')).replace(/^```$/gm, '');
}

function parsePrice(value) {
  const match = value.match(/\$\s*([\d,.]+)/);
  if (match) return Number(match[1].replace(',', '')) || null;
  return /free|gratis|\u2014|-/i.test(value) ? 0 : null;
}

function priceFromSource(markdown) {
  const promptIndex = markdown.search(/^##\s+THE PROMPT/im);
  const head = markdown.slice(0, promptIndex < 0 ? markdown.length : promptIndex);
  const monthly = head.match(/\$([\d.,]+)\/(mo|month|mo\.)/i);
  if (monthly) return Math.round(Number(monthly[1].replace(',', '')) * 100) / 100;
  const annual = markdown.match(/^\|\s*Ahorro anual[^|]*\|\s*\$([\d.,]+)\/(yr|year)/im);
  if (annual) return Math.round((Number(annual[1].replace(',', '')) / 12) * 100) / 100;
  const yearly = head.match(/\$([\d.,]+)\/(yr|year)/i);
  if (yearly) return Math.round((Number(yearly[1].replace(',', '')) / 12) * 100) / 100;
  return /free|gratis/i.test(head) ? 0 : null;
}

function parseVerdict(value) {
  const normalized = value.toLowerCase();
  if (normalized.includes('kinda')) return 'kinda';
  if (normalized.includes('no') || normalized.includes('not really')) return 'no';
  return 'yes';
}

function extractDescription(markdown) {
  const value = section(markdown, 'Descrip[^\\n]*app|Description[^\\n]*app');
  return value.split('\n\n')[0] || value;
}

function promptSection(prompt, heading) {
  const match = prompt.match(new RegExp(`^#{2,3}\\s+(?:${heading})[^\\n]*\\n([\\s\\S]*?)(?=^#{2,3}\\s|(?![\\s\\S]))`, 'im'));
  return clean(match?.[1] || '');
}
function parseSource(file, existingBySlug) {
  const slug = file.name.replace(/\.md$/i, '');
  const markdown = readFileSync(file.path, 'utf8');
  const existing = existingBySlug.get(slug) || existingBySlug.get(slugAliases[slug]);
  const name = clean(markdown.match(/^#\s+(.+)$/m)?.[1] || slug);
  const categoryValue = field(markdown, 'Categor.');
  const prompt = promptFrom(markdown);
  const lose = bullets(section(markdown, 'WHAT YOU LOSE|What you lose|LO QUE PIERDES'));
  const promptLimits = bullets(promptSection(prompt, 'Non-Goals|Out of Scope|Out of scope'));
  const derivedLosses = promptLimits.length ? promptLimits.slice(0, 6).map(item => item.replace(/^Deliberately\s+/i, '')) : [
    `Hosted infrastructure and managed operations from ${name}`,
    "The original service's mature integrations and ecosystem",
  ];
  const moat = bullets(section(markdown, 'MOAT.*'));
  const priorArt = links(section(markdown, 'PRIOR ART|Prior art.*|ALTERNATIVAS'));
  const similar = links(section(markdown, 'ALSO ONE-SHOTTABLE|ALSO ONE-SHOTTABLE'));
  const replacementValue = field(markdown, 'Reemplazado por|Replaced by');
  const replacements = Number(replacementValue.match(/\d+/)?.[0] || 0);
  const priceMonthly = priceFromSource(markdown);
  const app = {
    ...(existing || {}),
    slug,
    name: existing?.name || name,
    domain: existing?.domain || domainOverrides[slug] || `${slug}.com`,
    category: existing?.category || categorySlug(categoryValue),
    subcategory: existing?.subcategory ?? null,
    tagline: existing?.tagline || extractDescription(markdown) || `A practical replacement for ${name}.`,
    priceMonthly,
    pricing: {
      ...(existing?.pricing || {}),
      native: priceMonthly === null ? 'varies' : priceMonthly === 0 ? 'Free' : `$${priceMonthly}/mo`,
    },
    verdict: parseVerdict(field(markdown, 'Veredicto|Verdict')),
    verdictConfidence: existing?.verdictConfidence || 'medium',
    verdictSummary: existing?.verdictSummary || section(markdown, 'Descrip[^\\n]*|Description').split('\n\n')[0] || `${name} can be replaced with a focused build.`,
    coreLoopDIY: existing?.coreLoopDIY || extractDescription(markdown),
    diyTimeEstimate: existing?.diyTimeEstimate || field(markdown, 'Tiempo de build|Build time') || 'one sitting',
    requirements: existing?.requirements || [],
    whatYouLose: lose.length ? lose : (existing?.whatYouLose?.length ? existing.whatYouLose : derivedLosses),
    moatTags: existing?.moatTags?.length ? existing.moatTags : moat.map(slugify),
    moatNotes: moat.length ? moat.join(' \u00b7 ') : (existing?.moatNotes || null),
    whyPeopleStillPay: existing?.whyPeopleStillPay || extractDescription(markdown),
    priorArt: priorArt.length ? priorArt : (existing?.priorArt || []),
    relatedSlugs: similar.length ? similar.map(item => item.url.split('/').filter(Boolean).pop()).filter(Boolean) : (existing?.relatedSlugs || []),
    pagePriority: existing?.pagePriority || 2,
    verifiedOneShot: existing?.verifiedOneShot ?? parseVerdict(field(markdown, 'Veredicto|Verdict')) === 'yes',
    notes: existing?.notes || extractDescription(markdown),
    reportedReplacements: existing?.reportedReplacements ?? replacements,
    prompt: existing?.prompt || promptFrom(markdown),
  };
app.name = clean(app.name);
  app.tagline = clean(app.tagline);
  app.verdictSummary = clean(app.verdictSummary).replace(/Here['’]s the exact prompt to build your own and what you lose\\./gi, 'Here is the practical trade-off and what you lose.');
  app.moatNotes = app.moatNotes ? clean(app.moatNotes) : null;
  app.whyPeopleStillPay = app.whyPeopleStillPay ? clean(app.whyPeopleStillPay) : null;
  app.notes = clean(app.notes);
  app.whatYouLose = app.whatYouLose.map(clean);
  app.moatTags = app.moatTags.map(clean);
  app.priorArt = app.priorArt.map(item => ({ ...item, name: clean(item.name), desc: clean(item.desc) }));
  return app;
}

if (!existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);
if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

const existingBySlug = new Map();
for (const file of readdirSync(targetDir).filter(name => name.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(targetDir, file), 'utf8'));
  existingBySlug.set(data.slug, data);
}

for (const file of readdirSync(targetDir).filter(name => name.endsWith('.json'))) unlinkSync(join(targetDir, file));

const files = readdirSync(sourceDir).filter(name => name.endsWith('.md')).sort().map(name => ({ name, path: join(sourceDir, name) }));
for (const file of files) {
  const app = parseSource(file, existingBySlug);
  writeFileSync(join(targetDir, `${app.slug}.json`), `${JSON.stringify(app, null, 2)}\n`, 'utf8');
}

console.log(`Synced ${files.length} apps from ${sourceDir} to ${targetDir}`);
