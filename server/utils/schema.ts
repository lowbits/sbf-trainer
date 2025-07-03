import {z} from 'zod'

// User ID validation schema
export const userIdSchema = z.string().regex(/^anon_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, 'Invalid user ID format')


export const generatePodcastSchema = z.object({
    userId: userIdSchema.optional(),
    forceRegenerate: z.boolean().optional().default(false)
}).optional()

export const userTokenSchema = z.object({
    token: z.string().min(10).optional()
})

// Response schemas
export const userResponseSchema = z.object({
    success: z.boolean(),
    userId: userIdSchema,
    isNew: z.boolean()
})

export const knotSchema = z.object({
    name: z.string().describe('German name of the knot'),
    englishName: z.string().describe('English name of the knot'),
    image: z.string().describe('Emoji representation of the knot'),
    usage: z.string().describe('What the knot is used for (German)'),
    explanation: z.string().describe('Detailed explanation of the knot (German)'),
    steps: z.array(z.string()).describe('Step-by-step instructions for tying the knot'),
    difficulty: z.enum(['Einfach', 'Mittel', 'Schwer']).describe('Difficulty level of the knot')
});

export const podcastResponseSchema = z.object({
    success: z.boolean(),
    podcast: z.object({
        audioUrl: z.string(),
        script: z.object({
            title: z.string(),
            dailyIntro: z.string(),
            todaysTopics: z.string(),
            mainContent: z.array(z.object({
                section: z.string(),
                content: z.string(),
                questions: z.array(z.string())
            })),
            knotOfTheDay: z.string().optional(),
            quickTips: z.array(z.string()),
            conclusion: z.string(),
            estimatedDuration: z.string(),
            questionsUsed: z.array(z.string())
        }),
        cached: z.boolean()
    }),
    questions: z.array(z.object({
        id: z.string(),
        question: z.string(),
        answers: z.array(z.object({
            id: z.string(),
            text: z.string()
        })),
        correctAnswer: z.string(),
        explanation: z.string(),
        images: z.array(z.string()).optional().nullable(),
        metadata: z.object({
            category: z.string(),
            difficulty: z.string().optional()
        }).optional()
    })),
    knot: knotSchema.optional(),
})

export type Knot = z.infer<typeof knotSchema>

