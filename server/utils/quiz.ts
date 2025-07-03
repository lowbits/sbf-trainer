import basicQuestions from '~~/server/assets/data/basic.json'
import seaQuestions from '~~/server/assets/data/sea.json'
import knotsQuestion from '~~/server/assets/data/knots.json'
import type {Knot} from "~~/server/utils/schema";
import type {Question} from "~~/server/assets/data/questions";

export function shuffleArray<T>(array: readonly T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    return shuffled
}

export async function getRandomQuestionsFromFile(filename: 'knot', count: number): Promise<Knot[]>
export async function getRandomQuestionsFromFile(filename: 'basic' | 'sea', count: number): Promise<Question[]>
export async function getRandomQuestionsFromFile(
    filename: 'basic' | 'sea' | 'knot',
    count: number
): Promise<(Knot | Question)[]> {
    let questions: (Knot | Question)[]

    switch (filename) {
        case 'basic':
            questions = basicQuestions as Question[];
            break
        case 'sea':
            questions = seaQuestions as Question[];
            break;
        case 'knot':
            questions = knotsQuestion as Knot[];
            break
        default:
            throw new Error(`Unknown file: ${filename}`)
    }

    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export const getAllQuestions = async () => {
    return [...basicQuestions, ...seaQuestions]
}
