import basicQuestions from '~~/server/assets/data/basic.json'
import seaQuestions from '~~/server/assets/data/sea.json'

export function shuffleArray<T>(array: readonly T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    return shuffled
}

export async function getRandomQuestionsFromFile(filename: string, count: number) {
    let questions: any[]

    // Select the appropriate dataset
    switch (filename) {
        case 'basic.json':
            questions = basicQuestions
            break
        case 'sea.json':
            questions = seaQuestions
            break
        default:
            throw new Error(`Unknown file: ${filename}`)
    }

    // Get random subset immediately
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export const getAllQuestions = async () => {
    return [...basicQuestions, ...seaQuestions]
}
