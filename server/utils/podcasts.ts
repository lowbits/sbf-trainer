import {list} from "@vercel/blob";

export async function checkExistingPodcast(userId: string, date: string) {
    try {
        const {blobs} = await list({
            prefix: `podcasts/${userId}/${date}`,
            limit: 10
        });

        const audioBlob = blobs.find(blob => blob.pathname.endsWith('.mp3'));
        const scriptBlob = blobs.find(blob => blob.pathname.endsWith('-script.json'));

        if (audioBlob && scriptBlob) {
            // Fetch script content
            const scriptResponse = await fetch(scriptBlob.url);
            const scriptData = await scriptResponse.json();

            return {
                exists: true,
                audioUrl: audioBlob.url,
                script: scriptData.script,
                questions: scriptData.questions,
                knot: scriptData.knot,
                exam: scriptData.exam
            };
        }

        return {exists: false};
    } catch (error) {
        console.error('Error checking existing podcast:', error);
        return {exists: false};
    }
}
