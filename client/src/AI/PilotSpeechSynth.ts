// @ts-ignore
import Speech from "speak-tts";

export default class TextToSpeech {
    private static instance: TextToSpeech;
    private speech: Speech;
    private isPaused: boolean = false;

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
                console.log(">> Synthesizing Voice Initialized <<");
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
            .speak({
                text,
                queue: false,
                listeners: {
                    onstart: () => {
                        // console.log("Speech started");
                    },
                    onend: () => {
                        // console.log("Speech ended");
                        this.isPaused = false;
                    },
                    onpause: () => {
                        // console.log("Speech paused");
                    },
                    onresume: () => {
                        // console.log("Speech resumed");
                    },
                },
            })
            .then(() => {
                // console.log(`Speech completed: "${text}"`);
            })
            .catch((error: any) => {
                console.error("Error during speech synthesis:", error);
            });
    }

    /**
     * Pauses the ongoing speech synthesis.
     */
    public Pause(): void {
        if (this.speech.speaking()) {
            this.speech.pause();
            this.isPaused = true;
            console.log("Speech paused");
        } else {
            console.log("No speech is currently playing to pause");
        }
    }

    /**
     * Resumes the paused speech synthesis.
     */
    public Resume(): void {
        if (this.isPaused) {
            this.speech.resume();
            this.isPaused = false;
            console.log("Speech resumed");
        } else {
            console.log("No paused speech to resume");
        }
    }

    /**
     * Stops the ongoing speech synthesis.
     */
    public Stop(): void {
        if (this.speech.speaking()) {
            this.speech.cancel();
            this.isPaused = false;
            // console.log("Speech stopped");
        } else {
            console.log("No speech is currently playing to stop");
        }
    }

    /**
     * Returns the current status of the speech synthesis.
     * @returns true if speech synthesis is speaking, false otherwise.
     */
    public Status(): boolean {
        return this.speech.speaking();
    }
}
