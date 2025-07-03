import {podcastResponseSchema, userIdSchema} from "~~/server/utils/schema";
import {getUserIdFromEvent} from "~~/server/utils/user";
import {mkdir} from "node:fs/promises";
import fs from "fs/promises";

export default defineEventHandler(async (event) => {
    const userId = getUserIdFromEvent(event)
    const podcastDir = `./public/podcasts/${userId}/`;

    // Validate final userId
    const userIdValidation = userIdSchema.safeParse(userId)
    if (!userIdValidation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid user ID format'
        })
    }

    const today = new Date().toISOString().split('T')[0];
    await mkdir(podcastDir, {recursive: true});


    const existingFiles = await fs.readdir(podcastDir)
    const todaysPodcast = existingFiles.find(file => file.startsWith(today) && file.endsWith('.mp3'))

    if (todaysPodcast) {
        const scriptPath = `${podcastDir}${today}-script.json`

        try {
            const scriptData = await fs.readFile(scriptPath, 'utf-8')
            const {script, questions} = JSON.parse(scriptData)

            const cachedResponse = {
                success: true,
                podcast: {
                    audioUrl: `/podcasts/${userId}/${todaysPodcast}`,
                    script,
                    cached: true
                },
                questions
            }

            // Validate cached response
            return podcastResponseSchema.parse(cachedResponse)

        } catch (_) {
            console.warn('Could not load existing script, regenerating...')
        }
    }
})
