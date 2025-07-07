export const useTimer = (options: { immediate?: boolean } = {immediate: true}) => {
    const startTime = ref(Date.now())
    const timestamp = useTimestamp({interval: 1000, controls: true, immediate: options.immediate})

    const elapsedTime = computed(() => {
        const elapsed = timestamp.timestamp.value - startTime.value
        const seconds = Math.floor(elapsed / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    })

    return {
        startTime,
        elapsedTime,
        pause: timestamp.pause,
        resume: ()=> {
            timestamp.resume()
        },
        reset: () => {
            startTime.value = Date.now()
            if (options.immediate) {
                timestamp.resume()
            }
        }
    }
}
