// @ts-ignore
import Speech from "speak-tts";

export default class TextToSpeech {
    private static instance: TextToSpeech;
    private speech: Speech;

    private constructor() {
        this.speech = new Speech();
        this.initialize();
    }

    /**
     * Singleton pattern to ensure a single instance of TextToSpeech.
     */
    public static getInstance(): TextToSpeech {
        if (!TextToSpeech.instance) {
            TextToSpeech.instance = new TextToSpeech();
        }
        return TextToSpeech.instance;
    }

    /**
     * Initialize speech synthesis with default settings.
     */
    private initialize(): void {
        this.speech
            .init({
                volume: 0.5,
                lang: "en-GB",
                voice: "Google UK English Female",
                rate: 1.05,
                pitch: 1,
            })
            .then((_data: any) => {
                // console.log("Speech synthesis initialized successfully", data);
                console.log(">> Synthesizing Voice <<");
            })
            .catch((error: any) => {
                console.error("Error initializing speech synthesis:", error);
            });
    }

    /**
     * Speaks the given text using speech synthesis.
     * @param text - The text to be spoken.
     */
    public Speak(text: string): void {
        this.speech
            .speak({ text })
            .then(() => {
                console.log(`Speech completed: "${text}"`);
            })
            .catch((error: any) => {
                console.error("Error during speech synthesis:", error);
            });
    }
}
