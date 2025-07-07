import {podcastResponseSchema, userIdSchema} from "~~/server/utils/schema";
import {getUserIdFromEvent} from "~~/server/utils/user";
import {checkExistingPodcast} from "~~/server/utils/podcasts";

export default defineEventHandler(async (event) => {
    const userId = getUserIdFromEvent(event)

    const userIdValidation = userIdSchema.safeParse(userId)
    if (!userIdValidation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID format'
        })
    }


    const today = new Date().toISOString().split('T')[0];

    const existingPodcast = await checkExistingPodcast(userId, today);

    console.log(existingPodcast);

    if (existingPodcast.exists) {
        const cachedResponse = {
            success: true,
            podcast: {
                audioUrl: existingPodcast.audioUrl,
                script: existingPodcast.script,
                cached: true
            },
            questions: existingPodcast.questions,
            knot: existingPodcast.knot,
            exam: existingPodcast.exam,
        };

        return podcastResponseSchema.parse(cachedResponse);
    }
})
