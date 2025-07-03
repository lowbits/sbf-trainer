import {createOpenAI} from "@ai-sdk/openai";
import {consola} from "consola";
import {generateObject} from "ai";
import {z} from "zod";
import type {Question} from "~~/data/questions";
import {writeFile} from "node:fs/promises";

export default defineEventHandler(async () => {
    // ... Do whatever you want here


    const {page, browser} = await hubBrowser()

    await page.goto('https://www.elwis.de/DE/Sportschifffahrt/Sportbootfuehrerscheine/Fragenkatalog-See/Spezifische-Fragen-See/Spezifische-Fragen-See-node.html')

    await page.waitForSelector('#content');


    // Extract all questions
    const questions = await page.evaluate(() => {
        const results = [];
        const contentDiv = document.getElementById('content');

        // Find all question paragraphs (they seem to start with a number and period)
        const questionElements = contentDiv.querySelectorAll('p');

        for (let i = 0; i < questionElements.length; i++) {
            const p = questionElements[i];
            const text = p.textContent.trim();

            // Check if this paragraph contains a question (starts with number and period)
            if (/^\d+\.\s/.test(text)) {
                const questionNumber = text.match(/^(\d+)\./)[1];
                const questionText = text.replace(/^\d+\.\s/, ''); // Remove number prefix

                const question = {
                    id: `sbf-${questionNumber.padStart(3, '0')}`, // Format as sbf-001, sbf-017, etc.
                    question: questionText,
                    answers: [],
                    correctAnswer: 'A',
                    explanation: null,   // You'll need to extract this if available
                    images: [],
                    metadata: {
                        category: "spezifische fragen see",
                        licenseType: "see",
                        difficulty: undefined,
                        tags: []
                    }
                };

                // Look for images in the next paragraph(s)
                let nextElement = p.nextElementSibling;
                while (nextElement && nextElement.tagName === 'P') {
                    const img = nextElement.querySelector('img');
                    if (img) {
                        question.images.push({
                            src: img.src,
                            alt: img.alt || '' // This is the alt attribute you requested
                        });
                    }
                    nextElement = nextElement.nextElementSibling;
                    // Break if we hit an OL (answer list)
                    if (nextElement && nextElement.tagName === 'OL') break;
                }

                // Find the corresponding answer list (ol element that follows)
                let currentElement = p.nextElementSibling;
                while (currentElement) {
                    if (currentElement.tagName === 'OL') {
                        const listItems = currentElement.querySelectorAll('li');
                        listItems.forEach((li, index) => {
                            question.answers.push({
                                id: String.fromCharCode(65 + index), // A, B, C, D...
                                text: li.textContent.trim().replace(/\s+/g, ' ') // Clean up whitespace
                            });
                        });
                        break;
                    }
                    currentElement = currentElement.nextElementSibling;
                }

                results.push(question);
            }
        }

        return results;
    });


    const processedQuestions = questions.map(q => ({
        ...q,
        images: q.images.map(img => img.src), // Keep only URLs in images array
        imageAlts: q.images.map(img => img.alt) // Store alt texts separately if needed
    }));

    const response = JSON.stringify(processedQuestions, null, 2)
    await browser.close();

    consola.info('Good questions from url...');


    /*
    const openai = createOpenAI({
        apiKey: apiKey,
    });

    const {object } = await generateObject({
        model: openai('gpt-4-turbo'),
    })



    const testQuestion = {
        "id": "sbf-073",
        "question": "Wo gelten die Kollisionsverhütungsregeln (KVR)?",
        "answers": [
            { "id": "A", "text": "Auf der Hohen See und auf den mit dieser zusammenhängenden, von Seeschiffen befahrbaren Gewässern." },
            { "id": "B", "text": "Auf der Hohen See und den deutschen Seeschifffahrtsstraßen, die von Seeschiffen befahren werden." },
            { "id": "C", "text": "Auf den Seeschifffahrtsstraßen und den küstennahen deutschen Seegewässern, die von Seeschiffen befahren werden." },
            { "id": "D", "text": "Auf der Hohen See und den von Seeschiffen befahrbaren Randmeeren, mit Ausnahme der Verkehrstrennungsgebiete." }
        ],
        "correctAnswer": "A",
        "explanation": null,
        "metadata": { "category": "spezifische fragen see", "licenseType": "see", "tags": [] }
    };

    console.log('Testing single question enhancement...');
    const response = await enhanceQuestionWithTool(testQuestion);


     */


    console.log(response);
    consola.info('Trying to enhance questions with ai...');


    const {enhancedQuestions, errors} = await enhanceQuestionsWithSchema(processedQuestions);

    // Save results
    await writeFile(
        'enhanced_questions_with_schema.json',
        JSON.stringify(enhancedQuestions)
    );

    return JSON.stringify(enhancedQuestions);
})

const questionEnhancementSchema = z.object({
    explanation: z.string().describe('Kurze Erklärung auf Deutsch (maximal 1-2 Sätze, ca. 20-30 Wörter'),
    tags: z.array(z.string()).min(3).max(5).describe('Relevant tags for categorization')
});

async function enhanceQuestionsWithSchema(questions: Question[], batchSize = 5, delayMs = 1000) {
    const enhancedQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(questions.length / batchSize);

        console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} questions)`);
        console.log(batch)

        const batchPromises = batch.map(async (question) => {
            try {
                const enhanced = await enhanceQuestionWithTool(question);

                // Validate the enhancement - only check what we're adding
                if (!enhanced.explanation || !enhanced.metadata.tags.length) {
                    throw new Error('Invalid enhancement: missing explanation or tags');
                }

                return {success: true, question: enhanced};
            } catch (error) {
                return {success: false, question, error: error.message};
            }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    enhancedQuestions.push(result.value.question);
                } else {
                    errors.push({
                        questionId: batch[index].id,
                        error: result.value.error
                    });
                    enhancedQuestions.push(batch[index]); // Keep original
                }
            } else {
                errors.push({
                    questionId: batch[index].id,
                    error: result.reason
                });
                enhancedQuestions.push(batch[index]); // Keep original
            }
        });

        // Progress update
        const enhanced = enhancedQuestions.filter(q => q.explanation).length;
        console.log(`Progress: ${enhanced}/${enhancedQuestions.length} questions enhanced`);

        // Rate limiting
        if (i + batchSize < questions.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return {enhancedQuestions, errors};
}

// Enhanced function using generateObject with schema
async function enhanceQuestionWithTool(question: any) {
    try {
        const apiKey = useRuntimeConfig().openaiApiKey;
        if (!apiKey) throw new Error('Missing OpenAI API key');

        consola.info('Trying to enhance questions with ai...');

        const openai = createOpenAI({
            apiKey: apiKey,
        });

        const {object} = await generateObject({
            model: openai('gpt-4.1'),
            schema: questionEnhancementSchema,
            prompt: `
            Du bist ein Experte für Seerecht und Schifffahrtsregeln. 

            Analysiere diese Multiple-Choice-Frage und gib strukturierte Verbesserungen auf DEUTSCH:
            
            Frage: ${question.question}
            
            Antwortoptionen:
            ${question.answers.map(answer => `${answer.id}: ${answer.text}`).join('\n')}
            
            Richtige Antwort: ${question.correctAnswer}
            Kategorie: ${question.metadata.category}
            
            WICHTIG: 
            - Erklärung muss auf DEUTSCH sein
            - Maximal 1-2 kurze Sätze (20-30 Wörter)
            - Bei Schallsignalen: • = kurz, — = lang
            - Nur erklären warum die Antwort richtig ist, nicht warum andere falsch sind
            
            Gib eine sehr kurze, präzise Erklärung und relevante Tags für bessere Kategorisierung.
            `,
            temperature: 0.3,
        });

        return {
            ...question,
            explanation: object.explanation,
            metadata: {
                ...question.metadata,
                tags: object.tags
            }
        };

    } catch (error) {
        console.error(`Error enhancing question ${question.id}:`, error);
        return question;
    }
}
