// server/api/podcast/generate-daily.ts
import {experimental_generateSpeech, generateObject} from 'ai';
import {createOpenAI, openai} from '@ai-sdk/openai';
import {z} from 'zod';
import fs from 'fs/promises';
import path from 'path';
import {consola} from "consola";
import {generatePodcastSchema, podcastResponseSchema, userIdSchema} from "~~/server/utils/schema";
import {getUserIdFromEvent} from "~~/server/utils/user";
import {getAllQuestions, getRandomQuestionsFromFile} from "~~/server/utils/quiz";
import {list, put} from "@vercel/blob";
import {checkExistingPodcast} from "~~/server/utils/podcasts";

// Updated schema with correct field names
const podcastContentSchema = z.object({
    title: z.string().describe('Catchy title for today\'s personalized nautical episode'),
    dailyIntro: z.string().describe('Short, consistent daily opener that creates familiarity but varies slightly each day (10 seconds). Like "Moin! Hier ist dein täglicher Sportbootführerschein-Begleiter" but with daily variation'),
    todaysTopics: z.string().describe('Brief preview of today\'s specific topics to hook the listener (10 seconds)'),
    mainContent: z.array(z.object({
        section: z.string().describe('Section name relevant to user\'s nautical exam prep'),
        content: z.string().describe('Personalized nautical exam content speaking directly to the user with "du" (45 seconds of spoken content). Be more detailed and thorough to reach the time goal.'),
        questions: z.array(z.string()).describe('2-3 personalized reflection questions for the user about their exam preparation')
    })).max(2).describe('Main nautical content sections tailored to exam preparation'),
    quickTips: z.array(z.string()).max(3).describe('Quick personalized PRACTICAL nautical tips - focus on seamanship, navigation techniques, safety procedures, weather, anchoring, docking etc. NOT just abbreviations! Each tip should be 10 seconds when spoken.'),
    conclusion: z.string().describe('Personal wrap-up encouraging the user\'s exam preparation journey (20 seconds)'),
    estimatedDuration: z.string().describe('Estimated total duration - calculate based on speaking speed: intro(10s) + topics(10s) + 2x content(45s each) + tips(30s) + conclusion(20s) = ~2:40. Always estimate 2:30-2:50')
});

type PodcastContent = z.infer<typeof podcastContentSchema>;

// Helper function to safely replace abbreviations
function replaceNauticalAbbreviations(content: string | undefined | null): string {
    if (!content || typeof content !== 'string') {
        return '';
    }

    let processedContent = content;

    // Handle special light pattern cases with numbers - mention abbreviation for exam prep
    processedContent = processedContent.replace(/\bFl\.\s*\((\d+)\)/g, (match, number) => {
        return `F L Punkt, also Blitzfeuer alle ${number} Sekunden`;
    });

    processedContent = processedContent.replace(/\bIso\.\s*\((\d+)\)/g, (match, number) => {
        return `I S O Punkt, also Gleichtaktfeuer alle ${number} Sekunden`;
    });

    processedContent = processedContent.replace(/\bOc\.\s*\((\d+)\)/g, (match, number) => {
        return `O C Punkt, also Unterbrochenes Feuer alle ${number} Sekunden`;
    });

    // General abbreviation replacement - mention abbreviation first for exam prep
    const examAbbreviations: Record<string, string> = {
        'KVR': 'K V R, die Kollisionsverhütungsregeln',
        'SeeSchStrO': 'See-Schiff-Str-O, die Seeschifffahrtsstraßen-Ordnung',
        'EmsSchO': 'Ems-Sch-O, die Emschifffahrts-Ordnung',
        'BinSchStrO': 'Bin-Schiff-Str-O, die Binnenschifffahrtsstraßen-Ordnung',
        'SchSG': 'Sch-S-G, das Schiffssicherheitsgesetz',
        'SeeArbG': 'See-Arb-G, das Seearbeitsgesetz',
        'Fl.': 'F L Punkt, Blitzfeuer',
        'Iso.': 'I S O Punkt, Gleichtaktfeuer',
        'Oc.': 'O C Punkt, Unterbrochenes Feuer',
        'VQ': 'V Q, Sehr schnelles Funkelfeuer',
        'Q': 'Q, Schnelles Funkelfeuer',
        'LFl.': 'L F L Punkt, Langes Blitzfeuer',
        'Al.': 'A L Punkt, Wechselfeuer',
        'F.': 'F Punkt, Festfeuer',
        'Mo.': 'M O Punkt, Morsefeuer'
    };

    Object.entries(examAbbreviations).forEach(([abbr, fullExplanation]) => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'g');
        processedContent = processedContent.replace(regex, fullExplanation);
    });

    return processedContent;
}

// Fixed function to process podcast content with correct field names
function processPodcastContent(content: PodcastContent): PodcastContent {
    return {
        ...content,
        title: replaceNauticalAbbreviations(content.title),
        dailyIntro: replaceNauticalAbbreviations(content.dailyIntro),
        todaysTopics: replaceNauticalAbbreviations(content.todaysTopics),
        mainContent: content.mainContent.map(section => ({
            ...section,
            section: replaceNauticalAbbreviations(section.section),
            content: replaceNauticalAbbreviations(section.content),
            questions: section.questions.map(q => replaceNauticalAbbreviations(q))
        })),
        quickTips: content.quickTips.map(tip => replaceNauticalAbbreviations(tip)),
        conclusion: replaceNauticalAbbreviations(content.conclusion)
    };
}

// Generate daily podcast script with TypeScript types
async function generateDailyPodcastScript(date: string): Promise<PodcastContent & {
    date: string;
    questionsUsed: string[];
    metadata: {
        generatedAt: string;
        questionsCount: number;
        categories: string[];
    };
}> {
    try {
        const apiKey = useRuntimeConfig().openaiApiKey;
        const openai = createOpenAI({apiKey});

        const [basicQuestions, seaQuestions] = await Promise.all([
            getRandomQuestionsFromFile('basic.json', Math.floor(Math.random() * 4) + 5),
            getRandomQuestionsFromFile('sea.json', Math.floor(Math.random() * 4) + 5)
        ])

        // Select 5-8 random questions for today's episode
        const questions = [...basicQuestions, ...seaQuestions]

        const selectedQuestions = questions
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 4) + 5); // 5-8 questions

        // Check if any questions have images
        const questionsWithImages = selectedQuestions.filter((q: any) => q.images && q.images.length > 0);
        const hasImages = questionsWithImages.length > 0;

        const {object} = await generateObject({
            model: openai('gpt-4o'),
            schema: podcastContentSchema,
            prompt: `
Du erstellst einen täglichen Nautischen Podcast auf Deutsch. Heute ist ${date}.

Erstelle ein 2:30-2:50 Minuten langes Podcast-Skript mit folgenden Fragen:
${selectedQuestions.map((q: any, i: number) => {
                let questionText = `${i + 1}. ${q.question}`;

                // Add image description if question has images
                if (q.images && q.images.length > 0) {
                    questionText += `\n   🖼️ WICHTIG: Diese Frage hat ${q.images.length > 1 ? 'Bilder' : 'ein Bild'} - erkläre dem Hörer was normalerweise zu sehen ist, da er das Bild beim Hören nicht sehen kann!`;
                    questionText += `\n   📝 Bildbeschreibung nötig: Beschreibe Farbe, Form und wichtige Details des Seezeichens/Verkehrszeichens/der Flagge`;
                }

                questionText += `\nAntwort: ${q.answers.find((a: any) => a.id === q.correctAnswer)?.text}\nErklärung: ${q.explanation}`;
                return questionText;
            }).join('\n\n')}

${hasImages ? `
🎯 BESONDERS WICHTIG - BILDFRAGEN ERKLÄREN:
Da ${questionsWithImages.length} der heutigen Fragen Bilder enthalten, erkläre dem Hörer was normalerweise zu sehen ist!
` : ''}

WICHTIGE ZEITVORGABEN - DER PODCAST MUSS 2:30-2:50 MINUTEN LANG WERDEN:
- Intro: 10 Sekunden Sprechzeit
- Tagesvorschau: 10 Sekunden Sprechzeit  
- Hauptthema 1: 45 Sekunden Sprechzeit (sei ausführlicher!)
- Hauptthema 2: 45 Sekunden Sprechzeit (sei ausführlicher!)
- 3 Praktische Tipps: 30 Sekunden Sprechzeit (je 10 Sekunden pro Tipp)
- Abschluss: 20 Sekunden Sprechzeit
- GESAMT: 2:40 Minuten - das ist das Ziel!

BILDER/ZEICHEN ERKLÄREN:
- Wenn eine Frage ein Bild oder Zeichen zeigt, erkläre dem Hörer WAS auf dem Bild zu sehen ist
- Beispiel bei Verkehrszeichen: "Bei dieser Frage siehst du normalerweise ein blaues rundes Schild mit weißem Symbol..."
- Beispiel bei Seezeichen: "Das Bild zeigt eine rote Tonne mit Toppzeichen..."
- Beispiel bei Flaggen: "Hier ist eine rechteckige Flagge in blau und gelb zu sehen..."
- Beispiel bei Lichterführung: "Du erkennst auf dem Bild zwei weiße Lichter übereinander..."
- Der Hörer kann das Bild nicht sehen, also beschreibe Farbe, Form und wichtige Details kurz aber präzise!

PRAKTISCHE TIPPS - NICHT NUR ABKÜRZUNGEN:
- Fokussiere auf PRAKTISCHE Seamanship-Tipps, nicht nur Abkürzungen!
- Beispiele: Ankerverfahren, Knotentechniken, Wetterbeobachtung, Hafenmanöver
- Beispiele: Funkverfahren, Sicherheitsausrüstung, Revierkunde, Törnplanung
- Beispiele: Gezeitenberechnung, Peilverfahren, Notfallverhalten, Erste Hilfe
- NUR wenn relevant: erwähne Abkürzungen, aber focus auf PRAXIS!

WICHTIG - AUSSPRACHE & PRÜFUNGSVORBEREITUNG:
- Erwähne IMMER zuerst die Abkürzung für die Prüfung, dann die Bedeutung
- Beispiel: "K V R, die Kollisionsverhütungsregeln" statt nur "Kollisionsverhütungsregeln"
- Für Leuchtfeuer: "F L Punkt, also Blitzfeuer alle 2 Sekunden"
- Die Hörer müssen die Abkürzungen für die Prüfung lernen!
- Sprich den Hörer ruhig und entspannt mit "du" an - wie ein entspanntes Gespräch unter Freunden
- Verwende viele Pausen durch Punkte, Kommata und Absätze
- Lass zwischen verschiedenen Themen natürliche Pausen entstehen
- Verwende Übergangssätze wie "Kommen wir zum nächsten Punkt" oder "Schauen wir uns auch an..."
- Vermeide Ausrufezeichen - nutze stattdessen ruhige, bestimmte Aussagen

ABSOLUT KRITISCH FÜR DIE TIPPS - NIEMALS NUMMERIEREN:
- Verwende NIEMALS "Erstens, Zweitens, Drittens" oder "Erster Tipp, Zweiter Tipp, Dritter Tipp"
- Verwende NIEMALS "Punkt eins, Punkt zwei, Punkt drei" oder "1., 2., 3."
- Verwende NIEMALS "Zuerst, dann, und schließlich" in Aufzählungsform
- Verwende stattdessen fließende Übergänge wie:
  * "Ein wichtiger Punkt für die Praxis..."
  * "Außerdem solltest du beachten..."
  * "Und noch etwas wichtiges für unterwegs..."
  * "Denk auch daran..."
  * "Besonders nützlich ist..."
  * "Merk dir auch..."
  * "In der Praxis hat sich bewährt..."
- Lass die Tipps wie natürliche Gesprächsfortsetzungen klingen, OHNE Nummerierung
- Behandle es wie Ratschläge eines erfahrenen Skippers, nicht wie eine Liste!

STIL:
- Ruhig und entspannt, wie ein erfahrener Skipper beim gemütlichen Segeltörn
- Freundlich aber nicht überdreht
- Informativ aber nicht hektisch
- Mit natürlichen Sprechpausen zwischen den Themen
- Deutsche Sprache in ruhigem Gesprächston mit Bedenkzeit
- Wie ein entspanntes Gespräch im Hafen bei einem Kaffee - mit Pausen zum Nachdenken
- SEI AUSFÜHRLICHER um die Zieldauer von 2:30-2:50 zu erreichen!

STRUKTUR - DAILY PODCAST FORMAT:
- DAILY INTRO: Kurzer, wiedererkennbarer Opener (10 Sek) - z.B. "Moin! Hier ist dein täglicher SBF-Begleiter" mit leichter täglicher Variation
- TAGESVORSCHAU: Kurzer Appetizer auf die heutigen Themen (10 Sek) - "Heute schauen wir uns an..."
- 2 Hauptthemen mit Prüfungsrelevanz, AUSFÜHRLICH erklärt (je 45 Sek!) - sei detaillierter!
- 3 ruhige PRAKTISCHE Tipps - OHNE Nummerierung, fließend im Gespräch (30 Sek total)
- Entspannter Abschluss mit Prüfungsmotivation (20 Sek)

DAILY INTRO VARIATIONEN:
- "Moin! Hier ist dein täglicher Sportbootführerschein-Begleiter"
- "Servus! Zeit für deinen täglichen SBF-Check"
- "Ahoy! Dein täglicher Prüfungs-Podcast ist da"
- "Moin Moin! Bereit für deine tägliche Prüfungsvorbereitung?"
- Verwende unterschiedliche Begrüßungen, aber halte die Struktur erkennbar

Zielgruppe: Angehende Sportbootführerschein-Kandidaten, die TÄGLICH diesen Podcast als Prüfungsbegleiter hören

Du erstellst einen DAILY PODCAST - das bedeutet:
- Der Hörer kennt das Format bereits und hört täglich zu
- Schaffe Vertrautheit durch wiedererkennbare Elemente
- Variiere das Intro leicht, aber halte es familiar
- Mache Lust auf die heutigen spezifischen Themen
- Behandle es wie eine tägliche Routine zwischen Freunden

Schreibe so, als würdest du entspannt mit einem Freund über die bevorstehende Prüfung sprechen und ihm dabei helfen, sich die wichtigen Abkürzungen und Regeln zu merken. Verwende durchgehend das "du" - niemals "Sie"!

ZIEL: Ein 2:30-2:50 Minuten langer Podcast mit praktischen Tipps und Bildbeschreibungen!
`,
            temperature: 0.5,
        });

        return {
            ...object,
            date,
            questionsUsed: selectedQuestions.map((q: any) => q.id),
            metadata: {
                generatedAt: new Date().toISOString(),
                questionsCount: selectedQuestions.length,
                categories: [...new Set(selectedQuestions.map((q: any) => q.metadata.category))]
            }
        };

    } catch (error) {
        console.error('Error generating podcast script:', error);
        throw error;
    }
}

async function generateAudio(script: PodcastContent): Promise<{
    audio: Uint8Array;
    format?: string;
    mimeType?: string;
    warnings: string[];
}> {
    try {
        // Combine all script parts into one text (same as before)
        const fullScript = `
        ${script.dailyIntro}
        
        ${script.todaysTopics}
        
        ${script.mainContent.map((section, index) => `
        ${section.section}.
        
        ${section.content}
        
        ${index < script.mainContent.length - 1 ? '\n\nKommen wir zum nächsten wichtigen Punkt.\n' : ''}
        `).join('')}
        
        Hier sind noch ein paar praktische Hinweise für deine Prüfungsvorbereitung:
        
        ${script.quickTips.join('.\n\n')}
        
        ${script.conclusion}
        `.trim();

        consola.info('Generating audio with processed script...');

        const response = await experimental_generateSpeech({
            model: openai.speech('tts-1-hd'),
            voice: 'nova',
            text: fullScript,
            speed: 0.9
        });

        return {
            audio: response.audio.uint8Array,
            format: response.audio.format,
            mimeType: response.audio.mimeType,
            warnings: response.warnings || []
        };

    } catch (error) {
        console.error('Error generating audio:', error);
        throw error;
    }
}



// Main daily podcast generation endpoint
export default defineEventHandler(async (event) => {

    const body = await readValidatedBody(event, generatePodcastSchema.parse)


    const userId = body?.userId || getUserIdFromEvent(event)

    // Validate final userId
    const userIdValidation = userIdSchema.safeParse(userId)
    if (!userIdValidation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID format'
        })
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        const existingPodcast = await checkExistingPodcast(userId, today);


        if (existingPodcast.exists) {
            const cachedResponse = {
                success: true,
                podcast: {
                    audioUrl: existingPodcast.audioUrl,
                    script: existingPodcast.script,
                    cached: true
                },
                questions: existingPodcast.questions
            };

            return podcastResponseSchema.parse(cachedResponse);
        }


        consola.info(`Generating daily podcast for ${today}...`);

        const script = await generateDailyPodcastScript(today);

        consola.success(`Daily podcast script done...`);

        // Process the content for pronunciation
        const processedScript = processPodcastContent(script);

        consola.info(`Generating daily podcast audio...`);

        const audio = await generateAudio(processedScript);

        consola.success(`Daily podcast audio done...`);

        const usedQuestionIds = script.questionsUsed
        const allQuestions = await getAllQuestions()
        const usedQuestions = allQuestions.filter((q: any) => usedQuestionIds.includes(q.id));


        // Upload audio to Vercel Blob
        const podcastFilename = `${today}-${Math.floor(Math.random() * 1000)}.mp3`;
        const audioBlobPath = `podcasts/${userId}/${podcastFilename}`;

        const audioBuffer = Buffer.from(audio.audio);

        const audioBlob = await put(audioBlobPath, audioBuffer, {
            access: 'public',
            contentType: audio.mimeType || 'audio/mpeg'
        });


        const scriptData = {
            script: {...script, questionsUsed: usedQuestionIds},
            questions: usedQuestions,
            generatedAt: new Date().toISOString()
        };

        const scriptBlobPath = `podcasts/${userId}/${today}-script.json`;
        await put(scriptBlobPath, JSON.stringify(scriptData), {
            access: 'public',
            contentType: 'application/json'
        });


        const response = {
            success: true,
            podcast: {
                audioUrl: audioBlob.url,
                script: {
                    ...script,
                    questionsUsed: usedQuestionIds
                },
                cached: false
            },
            questions: usedQuestions
        };

        return podcastResponseSchema.parse(response)

    } catch (error) {
        console.error('Error in daily podcast generation:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate daily podcast'
        });
    }
});

// Utility functions for frontend
export async function getTodaysPodcast() {
    const today = new Date().toISOString().split('T')[0];
    const podcastDir = path.join(process.cwd(), 'public', 'podcasts');
    const scriptPath = path.join(podcastDir, `${today}-script.json`);
    const audioPath = path.join(podcastDir, `${today}.mp3`);

    try {
        await fs.access(audioPath);
        const script = JSON.parse(await fs.readFile(scriptPath, 'utf-8'));

        return {
            exists: true,
            audioUrl: `/podcasts/${today}.mp3`,
            script,
            date: today
        };
    } catch {
        return {
            exists: false,
            date: today
        };
    }
}

export async function getPodcastHistory(days = 7) {
    const podcasts = [];
    const podcastDir = path.join(process.cwd(), 'public', 'podcasts');

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const scriptPath = path.join(podcastDir, `${dateStr}-script.json`);
        const audioPath = path.join(podcastDir, `${dateStr}.mp3`);

        try {
            await fs.access(audioPath);
            const script = JSON.parse(await fs.readFile(scriptPath, 'utf-8'));

            podcasts.push({
                date: dateStr,
                audioUrl: `/podcasts/${dateStr}.mp3`,
                title: script.title,
                duration: script.estimatedDuration,
                questionsCount: script.metadata.questionsCount
            });
        } catch {
            // Podcast doesn't exist for this date
        }
    }

    return podcasts;
}
