export const useQuiz = (options: { questions: ExamQuestion[] }) => {
    const userAnswers = ref<Map<string, string>>(new Map())

    return {
        reset: ()=> {
            userAnswers.value = new Map()
        },
        track: (currentQuestionId: string, answerId: string)=> {
            userAnswers.value.set(currentQuestionId, answerId);
        },
        answers: userAnswers
    }
}
