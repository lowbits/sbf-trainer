import {elevenlabs} from "~~/server/tts/providers/elevenlabs";
import {experimental_generateSpeech} from "ai";
import {openai} from "@ai-sdk/openai";

export interface TTSResponse {
    audio: Uint8Array;
    format: string;
    mimeType: string;
}


export type TTSProvider = 'openai' | 'elevenlabs';

export class TextToSpeechService {
    private readonly provider: TTSProvider;

    constructor(provider: TTSProvider = 'elevenlabs') {
        this.provider = provider;
    }

    private async generateWithOpenAi(text: string) {
        const response = await experimental_generateSpeech({
            model: openai.speech('tts-1-hd'),
            voice: 'nova',
            text: text,
            speed: 0.9
        });

        return {
            audio: response.audio.uint8Array,
            format: response.audio.format,
            mimeType: response.audio.mimeType,
        };

    }

    private async generateWithElevenLabs(text: string): Promise<TTSResponse> {
        const VOICE_IDS = {
            mila: 'dCnu06FiOZma2KVNUoPZ',
            mathias: 'PAWzMWYQQXv6vAhaujU4'
        }


        const audio = await elevenlabs.textToSpeech.convert(VOICE_IDS.mila, {
            text: text,
            modelId: "eleven_multilingual_v2",
        });


        const response = new Response(audio);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);


        return {
            audio: uint8Array,
            format: 'mp3',
            mimeType: 'audio/mpeg'
        };
    }

    async generate(text: string): Promise<TTSResponse> {
        switch (this.provider) {
            case 'openai':
                return this.generateWithOpenAi(text);
            case 'elevenlabs':
                return this.generateWithElevenLabs(text);
            default:
                throw new Error(`Unsupported TTS provider...`);
        }
    }
}
