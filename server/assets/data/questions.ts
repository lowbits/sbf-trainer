export interface Question {
    id: string
    question: string
    answers: Array<{
        id: string
        text: string
    }>
    correctAnswer: string
    explanation: string
    images?: string[]
    metadata: {
        category: string
        licenseType: string
        difficulty?: string
        tags: string[]
    },
    imageAlts?: string[]
}


