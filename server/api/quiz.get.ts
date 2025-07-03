import {getRandomQuestionsFromFile, shuffleArray} from "~~/server/utils/quiz";
import {consola} from "consola";
import type {Question} from "~~/server/assets/data/questions";

export default defineEventHandler(async () => {
    const basicCount = 4
    const seaCount = 4
    consola.info("Trying to generate new quiz...")

    try {
        // Read files and immediately get random subset
        const [basicQuestions, seaQuestions] = await Promise.all([
            getRandomQuestionsFromFile('basic', basicCount),
            getRandomQuestionsFromFile('sea', seaCount),
        ])

        const quiz = createQuiz(basicQuestions, seaQuestions)

        return {
            id: generateQuizId(),
            questions: quiz,
            meta: {
                total: quiz.length,
                basic: basicQuestions.length,
                sea: seaQuestions.length,
                createdAt: new Date().toISOString()
            }
        }

    } catch (error) {
        consola.error("Error...", error)

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate quiz'
        })
    }
})

function createQuiz(basicQuestions: Question[], seaQuestions: Question[]): Question[] {
    consola.info('Combining questions')
    let quiz = [...basicQuestions, ...seaQuestions]

    consola.info('Shuffling answers')
    quiz = quiz.map(question => ({
        ...question,
        answers: shuffleArray([...question.answers])
    }))

    consola.info('Shuffling questions')
    quiz = shuffleArray(quiz)

    return quiz
}




function generateQuizId() {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
