import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface GenerateWorkBody {
  format?: string;
  subject?: string;
  topic?: string;
  language?: string;
  depth?: string;
  requirements?: string;
  studentName?: string;
  university?: string;
  faculty?: string;
  groupName?: string;
}

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY muhit o‘zgaruvchisi sozlanmagan.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getLanguageLabel(lang: string): string {
  if (lang === 'en') return 'English';
  if (lang === 'ru') return 'Russian (Русский язык)';
  return "Uzbek (O'zbek tili, lotin alifbosida)";
}

function getDepthTargets(format: string, depth: string): string {
  if (format === 'taqdimot') {
    if (depth === 'short') return '7-8 slides, concise 3-4 bullets per slide, clear speaker notes.';
    if (depth === 'extended') return '12-14 slides, rich analytical bullets (4-5 per slide), detailed speaker notes.';
    return '9-11 slides, balanced 4 bullets per slide, informative speaker notes.';
  }
  if (format === 'maqola') {
    if (depth === 'short') return '4 structured sections (Kirish, Asosiy tahlil, Muhokama, Xulosa), 2 well-developed paragraphs per section.';
    if (depth === 'extended') return '6 structured sections (Kirish, Adabiyotlar tahlili, Metodologiya, Asosiy natijalar, Muhokama, Xulosa va tavsiyalar), 3-4 rich academic paragraphs per section.';
    return '5 structured sections (Kirish, Nazariy asoslar, Tahlil va natijalar, Muhokama, Xulosa), 2-3 detailed paragraphs per section.';
  }
  // referat
  if (depth === 'short') return '4 sections (Kirish, 1-bob, 2-bob, Xulosa), 2 detailed paragraphs per section.';
  if (depth === 'extended') return '6 sections (Kirish, 1-bob, 2-bob, 3-bob, Amaliy tahlil, Xulosa va tavsiyalar), 3-4 deep academic paragraphs per section.';
  return '5 sections (Kirish, 1-bob: Nazariy asoslar, 2-bob: Tahliliy qism, 3-bob: Istiqbollar, Xulosa), 2-3 substantial paragraphs per section.';
}

function buildSystemInstruction(format: string, language: string, depth: string): string {
  const langLabel = getLanguageLabel(language);
  const target = getDepthTargets(format, depth);

  if (format === 'taqdimot') {
    return [
      `You are an experienced university professor and academic presentation designer.`,
      `Write ALL output strictly in ${langLabel}.`,
      `Create a high-clarity academic presentation slide deck for a student's independent work (mustaqil ish).`,
      `Target scope: ${target}`,
      `Slide 1 should be the Title slide (main topic and academic context). Slide 2 should be the Agenda/Plan (Reja). Middle slides should cover definitions, theoretical framework, analytical insights, real examples/comparisons, and conclusions. Include a final References slide.`,
      `Provide 4-7 academic references in standard bibliographic format.`,
      `Do not invent fake URLs or fabricated DOIs; cite real foundational books, textbooks, or standard academic concepts cleanly.`,
      `Also populate sections with a concise 2-section summary (Reja va Asosiy mazmun) and abstract so the work has complete metadata.`,
    ].join(' ');
  }

  if (format === 'maqola') {
    return [
      `You are an academic journal editor and university researcher.`,
      `Write ALL output strictly in ${langLabel}.`,
      `Prepare a publication-grade scientific/academic article (Ilmiy maqola) for a student's independent work.`,
      `Target scope: ${target}`,
      `Include a crisp scholarly abstract (120-180 words), 5-7 relevant keywords, deeply reasoned academic paragraphs with analytical clarity, and 5-8 bibliographic references.`,
      `Leave slides as an empty array [].`,
    ].join(' ');
  }

  return [
    `You are a senior university lecturer guiding a student's course report (Referat / Mustaqil ish).`,
    `Write ALL output strictly in ${langLabel}.`,
    `Prepare a well-structured academic Referat with formal university chapter headings, comprehensive theoretical explanation, analytical depth, practical relevance, clear conclusion, and 5-8 bibliographic references.`,
    `Target scope: ${target}`,
    `Include a clear executive summary in abstract (100-150 words) and 4-6 keywords. Leave slides as an empty array [].`,
  ].join(' ');
}

function clamp(str: unknown, maxLen: number): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatusCode(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { status?: number; code?: number; message?: string };
    if (typeof maybe.status === 'number') return maybe.status;
    if (typeof maybe.code === 'number') return maybe.code;
    if (typeof maybe.message === 'string') {
      if (maybe.message.includes('"code":503') || maybe.message.includes('UNAVAILABLE')) return 503;
      if (maybe.message.includes('"code":429') || maybe.message.includes('RESOURCE_EXHAUSTED')) return 429;
      if (maybe.message.includes('"code":400')) return 400;
      if (maybe.message.includes('"code":403') || maybe.message.includes('PERMISSION_DENIED')) return 403;
    }
  }
  return undefined;
}

function isRetryableError(err: unknown): boolean {
  const code = getErrorStatusCode(err);
  if (code === 503 || code === 500 || code === 502 || code === 504 || code === 429) {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('high demand') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNRESET')
  );
}

function formatFriendlyUzbekError(err: unknown): { status: number; message: string } {
  const code = getErrorStatusCode(err);
  if (code === 503) {
    return {
      status: 503,
      message:
        "AI serverida hozircha talab vaqtincha juda yuqori (503). Iltimos, 10–15 soniyadan so'ng qayta urinib ko'ring.",
    };
  }
  if (code === 429) {
    return {
      status: 429,
      message:
        "So'rovlar limiti vaqtincha to'ldi (429). Biroz kutib qayta urinib ko'ring.",
    };
  }
  if (code === 403 || code === 400) {
    return {
      status: code,
      message:
        "API kaliti yoki so'rov parametrlarida xatolik aniqlandi. Sozlamalarni tekshiring.",
    };
  }
  return {
    status: 500,
    message: "Mustaqil ishni yaratishda server xatoligi yuz berdi. Qayta urinib ko'ring.",
  };
}

app.post('/api/generate-work', async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as GenerateWorkBody;
    const format = clamp(body.format, 20);
    const subject = clamp(body.subject, 140);
    const topic = clamp(body.topic, 240);
    const language = clamp(body.language, 10) || 'uz';
    const depth = clamp(body.depth, 20) || 'standard';
    const requirements = clamp(body.requirements, 800);
    const studentName = clamp(body.studentName, 120);
    const university = clamp(body.university, 180);
    const faculty = clamp(body.faculty, 160);
    const groupName = clamp(body.groupName, 60);

    if (!['maqola', 'taqdimot', 'referat'].includes(format)) {
      res.status(400).json({ error: "Noto'g'ri ish formati tanlandi." });
      return;
    }
    if (subject.length < 2 || topic.length < 3) {
      res.status(400).json({ error: "Fan nomi kamida 2 ta, mavzu kamida 3 ta belgidan iborat bo'lishi kerak." });
      return;
    }
    if (!['uz', 'en', 'ru'].includes(language)) {
      res.status(400).json({ error: "Qo'llab-quvvatlanmaydigan til tanlandi." });
      return;
    }
    if (!['short', 'standard', 'extended'].includes(depth)) {
      res.status(400).json({ error: "Noto'g'ri hajm darajasi tanlandi." });
      return;
    }

    const ai = getGenAIClient();
    const systemInstruction = buildSystemInstruction(format, language, depth);

    const promptLines = [
      `Format: ${format.toUpperCase()}`,
      `Subject (Fan): ${subject}`,
      `Topic (Mavzu): ${topic}`,
      `Student: ${studentName || 'Talaba'} (${university || 'Universitet'}, ${faculty || 'Fakultet'}, ${groupName || 'Guruh'})`,
      requirements ? `Additional instructor requirements: ${requirements}` : '',
    ].filter(Boolean);

    const requestConfig = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Academic title of the work.' },
          subtitle: { type: Type.STRING, description: 'Concise academic subtitle or subject framing.' },
          abstract: { type: Type.STRING, description: 'Academic abstract or executive summary.' },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '5 to 7 relevant academic keywords.',
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING, description: 'Section or chapter heading.' },
                paragraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Detailed academic paragraphs for this section.',
                },
              },
              required: ['heading', 'paragraphs'],
            },
            description: 'Structured sections for Referat or Maqola.',
          },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Slide title.' },
                subtitle: { type: Type.STRING, description: 'Optional slide subtitle.' },
                bullets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Concise presentation bullet points.',
                },
                notes: { type: Type.STRING, description: 'Presenter speaker notes.' },
              },
              required: ['title', 'bullets', 'notes'],
            },
            description: 'Presentation slides when format is taqdimot.',
          },
          references: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Formatted academic references list.',
          },
        },
        required: ['title', 'subtitle', 'abstract', 'keywords', 'sections', 'slides', 'references'],
      },
    };

    const contents = promptLines.join('\n');
    const modelAttempts: Array<{ model: string; delayMs: number }> = [
      { model: 'gemini-4-hydrogen', delayMs: 0 },
      { model: 'gemini-4-hydrogen', delayMs: 1000 },
      { model: 'gemini-4-hydrogen', delayMs: 2200 },
      { model: 'gemini-3.1-flash-lite', delayMs: 400 },
      { model: 'gemini-3.1-flash-lite', delayMs: 1500 },
    ];

    let responseText: string | undefined;
    let lastError: unknown;

    for (const attempt of modelAttempts) {
      if (attempt.delayMs > 0) {
        await sleep(attempt.delayMs);
      }
      try {
        const result = await ai.models.generateContent({
          model: attempt.model,
          contents,
          config: requestConfig,
        });
        const txt = result.text?.trim();
        if (txt) {
          responseText = txt;
          break;
        }
      } catch (err) {
        lastError = err;
        if (!isRetryableError(err)) {
          throw err;
        }
        console.warn(`Model ${attempt.model} transient error, retrying...`);
      }
    }

    if (!responseText) {
      if (lastError) {
        throw lastError;
      }
      res.status(502).json({ error: "AI javobi bo'sh qaytdi. Iltimos, qayta urinib ko'ring." });
      return;
    }

    const parsed = JSON.parse(responseText) as {
      title?: string;
      subtitle?: string;
      abstract?: string;
      keywords?: string[];
      sections?: Array<{ heading?: string; paragraphs?: string[] }>;
      slides?: Array<{ title?: string; subtitle?: string; bullets?: string[]; notes?: string }>;
      references?: string[];
    };

    const sanitized = {
      title: clamp(parsed.title, 260) || topic,
      subtitle: clamp(parsed.subtitle, 300),
      abstract: clamp(parsed.abstract, 3000),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map((k) => clamp(k, 80)).filter(Boolean).slice(0, 10)
        : [],
      sections: Array.isArray(parsed.sections)
        ? parsed.sections
            .slice(0, 15)
            .map((s) => ({
              heading: clamp(s?.heading, 240) || "Bo'lim",
              paragraphs: Array.isArray(s?.paragraphs)
                ? s.paragraphs.map((p) => clamp(p, 4000)).filter(Boolean).slice(0, 20)
                : [],
            }))
            .filter((s) => s.paragraphs.length > 0)
        : [],
      slides: Array.isArray(parsed.slides)
        ? parsed.slides
            .slice(0, 20)
            .map((sl) => ({
              title: clamp(sl?.title, 240) || 'Slayd',
              subtitle: clamp(sl?.subtitle, 240),
              bullets: Array.isArray(sl?.bullets)
                ? sl.bullets.map((b) => clamp(b, 400)).filter(Boolean).slice(0, 12)
                : [],
              notes: clamp(sl?.notes, 1200),
            }))
        : [],
      references: Array.isArray(parsed.references)
        ? parsed.references.map((r) => clamp(r, 400)).filter(Boolean).slice(0, 20)
        : [],
    };

    res.json(sanitized);
  } catch (err) {
    console.error('Error generating academic work:', err);
    const friendly = formatFriendlyUzbekError(err);
    res.status(friendly.status).json({ error: friendly.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IlmNoma server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
