import {join} from "pathe";
import {readFile} from "node:fs/promises";

export function shuffleArray<T>(array: readonly T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    return shuffled
}

export async function getRandomQuestionsFromFile(filename: string, count: number) {
    const filePath = join(process.cwd(), 'data', filename)
    const data = await readFile(filePath, 'utf8')
    const questions = JSON.parse(data)

    // Get random subset immediately
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}


export const getAllQuestions = async () => {
    const [basic, sea] = await Promise.all([
        readFile(join(process.cwd(), 'data', 'basic.json'), 'utf8'),
        readFile(join(process.cwd(), 'data', 'sea.json'), 'utf8'),
    ])
    return [...JSON.parse(basic), ...JSON.parse(sea)]
}
