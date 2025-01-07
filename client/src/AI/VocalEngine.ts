type SpeechListener = {
    startListening: (
        onResult: (text: string) => void,
        onSilence: () => void // New callback for silence detection
    ) => void;
    stopListening: () => void;
};

const createSpeechListenerWithSilenceTimeout = (
    lang: string = "en-US",
    silenceTimeoutMs: number = 2000
): SpeechListener => {
    const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        throw new Error("Web Speech API is not supported in this browser.");
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true; // Continuous listening
    recognition.interimResults = true; // Allow partial results

    let isListening = false;
    let silenceTimeout: NodeJS.Timeout | null = null;

    const startListening = (
        onResult: (text: string) => void,
        onSilence: () => void // Accept onSilence callback
    ): void => {
        if (isListening) return; // Prevent multiple starts
        isListening = true;

        recognition.start();

        recognition.onresult = (event: any): void => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + " ";
            }
            onResult(transcript.trim()); // Send live transcript to callback

            // Reset the silence timeout
            if (silenceTimeout) clearTimeout(silenceTimeout);
            silenceTimeout = setTimeout(() => {
                console.log("No speech detected for 3 seconds. Triggering silence callback...");
                onSilence(); // Trigger the silence callback
            }, silenceTimeoutMs);
        };

        recognition.onerror = (event: any): void => {
            console.error("Speech recognition error:", event.error);
            stopListening();
        };

        recognition.onend = (): void => {
            if (isListening) {
                console.log("Restarting speech recognition...");
                recognition.start(); // Restart if still listening
            }
        };

        // Start the silence timeout immediately
        silenceTimeout = setTimeout(() => {
            console.log("No speech detected for 2 seconds. Triggering silence callback...");
            onSilence(); // Trigger the silence callback
        }, silenceTimeoutMs);
    };

    const stopListening = (): void => {
        isListening = false;
        recognition.stop();

        if (silenceTimeout) {
            clearTimeout(silenceTimeout);
            silenceTimeout = null;
        }
        console.log("Speech recognition stopped.");
    };

    return {
        startListening,
        stopListening,
    };
};

export default createSpeechListenerWithSilenceTimeout;
