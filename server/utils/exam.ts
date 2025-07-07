// server/utils/sbfExamGenerator.ts
// SBF Exam Sheet Generator with Zod validation for Nuxt 3
// Based on official regulation from March 12, 2012

import { z } from 'zod'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Official question number distribution for all 15 exam sheets
 * Source: Federal Ministry announcement from March 12, 2012
 */
export const OFFICIAL_EXAM_SHEETS: Record<number, number[]> = {
    1: [8, 16, 17, 32, 47, 60, 63, 79, 88, 92, 106, 124, 132, 140, 147, 150, 158, 159, 171, 176, 182, 194, 202, 209, 216, 224, 235, 253, 265, 271],
    2: [7, 15, 27, 39, 48, 67, 71, 78, 89, 93, 100, 118, 122, 134, 139, 152, 157, 166, 167, 177, 181, 187, 197, 207, 214, 218, 232, 243, 252, 279],
    3: [6, 18, 31, 37, 40, 53, 61, 77, 90, 94, 101, 126, 136, 142, 146, 151, 155, 160, 174, 178, 182, 188, 195, 204, 210, 221, 230, 234, 272, 282],
    4: [5, 21, 32, 38, 54, 59, 68, 76, 91, 100, 105, 130, 153, 163, 165, 166, 168, 177, 178, 188, 198, 203, 214, 223, 246, 255, 270, 273, 278, 284],
    5: [4, 23, 31, 44, 58, 65, 72, 75, 92, 101, 113, 121, 128, 136, 141, 146, 148, 154, 164, 170, 171, 179, 183, 196, 204, 211, 216, 225, 237, 266],
    6: [3, 8, 24, 41, 49, 62, 70, 74, 93, 99, 111, 114, 115, 127, 135, 140, 155, 157, 169, 178, 191, 208, 215, 226, 236, 243, 248, 260, 277, 281],
    7: [2, 7, 25, 42, 45, 59, 69, 73, 80, 111, 115, 117, 125, 131, 134, 145, 157, 162, 172, 175, 184, 191, 202, 213, 216, 229, 235, 249, 261, 274],
    8: [1, 26, 35, 42, 55, 64, 70, 80, 82, 95, 107, 116, 129, 138, 142, 147, 154, 167, 173, 180, 190, 192, 201, 210, 222, 231, 241, 247, 254, 266],
    9: [3, 15, 27, 38, 43, 48, 50, 78, 81, 86, 90, 96, 106, 117, 119, 128, 144, 153, 160, 165, 189, 195, 205, 219, 220, 240, 242, 247, 257, 269],
    10: [14, 27, 28, 39, 51, 67, 71, 82, 88, 97, 109, 118, 123, 130, 132, 149, 156, 161, 166, 172, 187, 190, 197, 206, 225, 239, 244, 276, 278, 280],
    11: [9, 13, 30, 40, 50, 57, 64, 73, 83, 84, 85, 98, 112, 119, 120, 126, 127, 131, 139, 143, 150, 158, 163, 179, 185, 200, 207, 238, 268, 283],
    12: [2, 12, 29, 36, 44, 52, 72, 84, 87, 99, 108, 120, 133, 137, 149, 162, 165, 170, 176, 188, 192, 199, 205, 219, 232, 245, 250, 258, 262, 285],
    13: [11, 16, 22, 34, 46, 56, 65, 85, 102, 110, 125, 136, 137, 141, 145, 161, 168, 180, 193, 196, 206, 212, 217, 228, 233, 248, 251, 258, 267, 275],
    14: [10, 15, 20, 33, 46, 68, 72, 86, 103, 109, 122, 126, 129, 133, 148, 156, 168, 172, 186, 189, 201, 209, 215, 217, 241, 244, 251, 256, 259, 263],
    15: [1, 9, 19, 31, 45, 53, 66, 87, 98, 104, 123, 124, 125, 127, 135, 138, 151, 152, 164, 175, 181, 185, 203, 212, 227, 242, 245, 264, 271, 279]
} as const

export const EXAM_CONSTANTS = {
    BASIC_QUESTION_COUNT: 7,
    SPECIFIC_QUESTION_COUNT: 23,
    TOTAL_QUESTION_COUNT: 30,
    BASIC_QUESTION_LIMIT: 72,
    TIME_LIMIT_MINUTES: 60,
    PASSING_SCORES: {
        BASIC_REQUIRED: 5,
        SPECIFIC_REQUIRED: 17,
        TOTAL_REQUIRED: 22
    }
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts question number to question ID format with validation
 */
export function questionNumberToId(questionNumber: number): string {
    if (questionNumber < 1 || questionNumber > 285) {
        throw new Error(`Question number must be between 1 and 285, got: ${questionNumber}`)
    }
    return `sbf-${questionNumber.toString().padStart(3, '0')}`
}

/**
 * Extracts question number from question ID with validation
 */
export function questionIdToNumber(questionId: string): number {
    const match = questionId.match(/^sbf-(\d{3})$/)
    if (!match) {
        throw new Error(`Invalid question ID format: ${questionId}. Expected format: sbf-001`)
    }
    const number = parseInt(match[1], 10)
    if (number < 1 || number > 285) {
        throw new Error(`Question number out of range: ${number}. Must be between 1 and 285`)
    }
    return number
}

/**
 * Checks if a question number is a basic question
 */
export function isBasicQuestion(questionNumber: number): boolean {
    return questionNumber <= EXAM_CONSTANTS.BASIC_QUESTION_LIMIT
}

/**
 * Safely parses and validates question data
 */
export function parseQuestions(data: unknown): SBFQuestion[] {
    const questionsArray = z.array(SBFQuestionSchema).parse(data)
    return questionsArray
}

/**
 * Safely parses and validates exam sheet data
 */
export function parseExamSheet(data: unknown): ExamSheet {
    return ExamSheetSchema.parse(data)
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Finds a question by its ID in the provided question arrays with validation
 */
export function findQuestionById(
    questionId: string,
    basicQuestions: SBFQuestion[],
    seaQuestions: SBFQuestion[]
): SBFQuestion {
    const questionNumber = questionIdToNumber(questionId) // Validates format

    const questions = isBasicQuestion(questionNumber) ? basicQuestions : seaQuestions
    const question = questions.find(q => q.id === questionId)

    if (!question) {
        throw new Error(`Question ${questionId} not found in ${isBasicQuestion(questionNumber) ? 'basic' : 'sea'} questions`)
    }

    // Validate the found question
    return SBFQuestionSchema.parse(question)
}

/**
 * Generates a specific exam sheet based on official question distribution with full validation
 */
export function createExamSheet(
    sheetNumber: number,
    basicQuestions: unknown, // Accept unknown and validate
    seaQuestions: unknown
): ExamSheet {
    // Validate inputs
    if (sheetNumber < 1 || sheetNumber > 15) {
        throw new Error('Sheet number must be between 1 and 15')
    }

    const validatedBasicQuestions = parseQuestions(basicQuestions)
    const validatedSeaQuestions = parseQuestions(seaQuestions)

    const questionNumbers = OFFICIAL_EXAM_SHEETS[sheetNumber]
    if (!questionNumbers) {
        throw new Error(`No question distribution found for sheet ${sheetNumber}`)
    }

    const examQuestions: ExamQuestion[] = []

    questionNumbers.forEach((questionNumber, index) => {
        const questionId = questionNumberToId(questionNumber)
        const question = findQuestionById(questionId, validatedBasicQuestions, validatedSeaQuestions)

        const examQuestion: ExamQuestion = {
            ...question,
            examPosition: index + 1,
            originalQuestionNumber: questionNumber
        }

        // Validate the exam question structure
        examQuestions.push(ExamQuestionSchema.parse(examQuestion))
    })

    const examSheet: ExamSheet = {
        id: `exam-sheet-${sheetNumber.toString().padStart(2, '0')}`,
        title: `Prüfungsbogen ${sheetNumber}`,
        description: `Offizieller SBF-See Prüfungsbogen ${sheetNumber} mit ${EXAM_CONSTANTS.BASIC_QUESTION_COUNT} Basisfragen und ${EXAM_CONSTANTS.SPECIFIC_QUESTION_COUNT} spezifischen Fragen`,
        questions: examQuestions,
        metadata: {
            type: 'official-exam-sheet',
            sheetNumber,
            totalQuestions: EXAM_CONSTANTS.TOTAL_QUESTION_COUNT,
            basicQuestions: EXAM_CONSTANTS.BASIC_QUESTION_COUNT,
            specificQuestions: EXAM_CONSTANTS.SPECIFIC_QUESTION_COUNT,
            timeLimit: EXAM_CONSTANTS.TIME_LIMIT_MINUTES,
            passingScore: {
                basic: EXAM_CONSTANTS.PASSING_SCORES.BASIC_REQUIRED,
                specific: EXAM_CONSTANTS.PASSING_SCORES.SPECIFIC_REQUIRED,
                total: EXAM_CONSTANTS.PASSING_SCORES.TOTAL_REQUIRED
            },
            createdAt: new Date().toString()
        }
    }

    // Final validation of the complete exam sheet
    return ExamSheetSchema.parse(examSheet)
}

/**
 * Generates all 15 official exam sheets with validation
 */
export function createAllExamSheets(
    basicQuestions: unknown,
    seaQuestions: unknown
): ExamSheet[] {
    const examSheets: ExamSheet[] = []

    for (let sheetNumber = 1; sheetNumber <= 15; sheetNumber++) {
        try {
            const examSheet = createExamSheet(sheetNumber, basicQuestions, seaQuestions)
            examSheets.push(examSheet)
        } catch (error) {
            console.error(`Error creating exam sheet ${sheetNumber}:`, error)
            throw new Error(`Failed to create exam sheet ${sheetNumber}: ${error}`)
        }
    }

    return examSheets
}

/**
 * Shuffles answer options to simulate real exam conditions with validation
 */
export function shuffleQuestionAnswers(question: ExamQuestion): ShuffledQuestion {
    const validatedQuestion = ExamQuestionSchema.parse(question)
    const shuffledAnswers = shuffleArray(validatedQuestion.answers)

    // Find the correct answer text
    const correctAnswerText = validatedQuestion.answers.find(
        answer => answer.id === validatedQuestion.correctAnswer
    )?.text

    if (!correctAnswerText) {
        throw new Error(`Correct answer ${validatedQuestion.correctAnswer} not found in question ${validatedQuestion.id}`)
    }

    // Find the new ID for the correct answer
    const newCorrectAnswer = shuffledAnswers.find(
        answer => answer.text === correctAnswerText
    )?.id

    if (!newCorrectAnswer) {
        throw new Error(`Could not find shuffled correct answer for question ${validatedQuestion.id}`)
    }

    const shuffledQuestion: ShuffledQuestion = {
        ...validatedQuestion,
        answers: shuffledAnswers,
        correctAnswer: newCorrectAnswer,
        originalCorrectAnswer: validatedQuestion.correctAnswer
    }

    return ShuffledQuestionSchema.parse(shuffledQuestion)
}

/**
 * Shuffles all questions in an exam sheet with validation
 */
export function shuffleExamSheet(examSheet: ExamSheet): ExamSheet & {
    questions: ShuffledQuestion[]
} {
    const validatedExamSheet = ExamSheetSchema.parse(examSheet)
    const shuffledQuestions = validatedExamSheet.questions.map(shuffleQuestionAnswers)

    return {
        ...validatedExamSheet,
        questions: shuffledQuestions
    }
}

/**
 * Comprehensive validation using Zod schemas
 */
export function validateExamSheet(examSheet: unknown): ValidationResult {
    try {
        ExamSheetSchema.parse(examSheet)
        return ValidationResultSchema.parse({
            isValid: true,
            errors: [],
            warnings: []
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err =>
                `${err.path.join('.')}: ${err.message}`
            )
            return ValidationResultSchema.parse({
                isValid: false,
                errors,
                warnings: []
            })
        }

        return ValidationResultSchema.parse({
            isValid: false,
            errors: [String(error)],
            warnings: []
        })
    }
}

/**
 * Gets exam sheet statistics with validation
 */
export function getExamSheetStats(examSheet: unknown) {
    const validatedSheet = ExamSheetSchema.parse(examSheet)

    const basicQuestions = validatedSheet.questions.filter(q =>
        q.originalQuestionNumber <= EXAM_CONSTANTS.BASIC_QUESTION_LIMIT
    )
    const specificQuestions = validatedSheet.questions.filter(q =>
        q.originalQuestionNumber > EXAM_CONSTANTS.BASIC_QUESTION_LIMIT
    )

    return {
        totalQuestions: validatedSheet.questions.length,
        basicQuestions: basicQuestions.length,
        specificQuestions: specificQuestions.length,
        categories: [...new Set(validatedSheet.questions.map(q => q.metadata.category))],
        difficulties: [...new Set(validatedSheet.questions.map(q => q.metadata.difficulty))],
        tags: [...new Set(validatedSheet.questions.flatMap(q => q.metadata.tags))]
    }
}
