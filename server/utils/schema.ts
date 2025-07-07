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


export const SBFAnswerSchema = z.object({
    id: z.string().regex(/^[A-D]$/, 'Answer ID must be A, B, C, or D'),
    text: z.string().min(1, 'Answer text cannot be empty')
})

const BaseSBFQuestionSchema = z.object({
    id: z.string().regex(/^sbf-\d{3}$/, 'Question ID must follow format: sbf-001'),
    question: z.string().min(1, 'Question text cannot be empty'),
    answers: z.array(SBFAnswerSchema)
        .length(4, 'Each question must have exactly 4 answers')
        .refine(
            answers => {
                const ids = answers.map(a => a.id)
                return new Set(ids).size === 4 &&
                    ids.every(id => ['A', 'B', 'C', 'D'].includes(id))
            },
            'Answers must have unique IDs A, B, C, D'
        ),
    correctAnswer: z.string().regex(/^[A-D]$/, 'Correct answer must be A, B, C, or D'),
    explanation: z.string().min(1, 'Explanation cannot be empty'),
    images: z.array(z.string().url()).optional().nullable(),
    metadata: z.object({
        category: z.string().min(1),
        licenseType: z.enum(['binnen', 'see', 'both']),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        tags: z.array(z.string())
    })
})

export const SBFQuestionSchema = BaseSBFQuestionSchema.refine(
    data => data.answers.some(answer => answer.id === data.correctAnswer),
    'Correct answer must exist in answers array'
)

const BaseExamQuestionSchema = BaseSBFQuestionSchema.merge(
    z.object({
        examPosition: z.number().int().min(1).max(30),
        originalQuestionNumber: z.number().int().min(1).max(285)
    })
)

export const ExamQuestionSchema = BaseExamQuestionSchema.refine(
    data => data.answers.some(answer => answer.id === data.correctAnswer),
    'Correct answer must exist in answers array'
)

export const ShuffledQuestionSchema = BaseExamQuestionSchema.merge(
    z.object({
        originalCorrectAnswer: z.string().regex(/^[A-D]$/)
    })
).refine(
    data => data.answers.some(answer => answer.id === data.correctAnswer),
    'Correct answer must exist in answers array'
)

export const ExamSheetMetadataSchema = z.object({
    type: z.literal('official-exam-sheet'),
    sheetNumber: z.number().int().min(1).max(15),
    totalQuestions: z.literal(30),
    basicQuestions: z.literal(7),
    specificQuestions: z.literal(23),
    timeLimit: z.literal(60),
    passingScore: z.object({
        basic: z.literal(5),
        specific: z.literal(17),
        total: z.literal(22)
    }),
    createdAt: z.string()
})

export const ExamSheetSchema = z.object({
    id: z.string().regex(/^exam-sheet-\d{2}$/, 'ExamSimulator sheet ID must follow format: exam-sheet-01'),
    title: z.string(),
    description: z.string(),
    questions: z.array(ExamQuestionSchema).length(30, 'ExamSimulator sheet must have exactly 30 questions'),
    metadata: ExamSheetMetadataSchema
}).refine(
    data => {
        const basicCount = data.questions.filter(q => q.originalQuestionNumber <= 72).length
        const specificCount = data.questions.filter(q => q.originalQuestionNumber > 72).length
        return basicCount === 7 && specificCount === 23
    },
    'ExamSimulator sheet must have exactly 7 basic questions and 23 specific questions'
)

export const ValidationResultSchema = z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string())
})



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
    questions: z.array(SBFQuestionSchema), // Now using the proper question schema!
    knot: knotSchema.optional(),
    exam: ExamSheetSchema.optional() // Now using the proper exam schema!
})

export type SBFAnswer = z.infer<typeof SBFAnswerSchema>
export type SBFQuestion = z.infer<typeof SBFQuestionSchema>
export type ExamQuestion = z.infer<typeof ExamQuestionSchema>
export type ExamSheet = z.infer<typeof ExamSheetSchema>
export type ExamSheetMetadata = z.infer<typeof ExamSheetMetadataSchema>
export type ShuffledQuestion = z.infer<typeof ShuffledQuestionSchema>
export type ValidationResult = z.infer<typeof ValidationResultSchema>
export type Knot = z.infer<typeof knotSchema>
