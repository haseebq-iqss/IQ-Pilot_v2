type SpeechListener = {
    startListening: (
        onResult: (text: string) => void,
        onSilence: () => void // New callback for silence detection
    ) => void;
    stopListening: () => void;
};

const createSpeechListenerWithWordTimeout = (
    lang: string = "en-US",
    wordTimeoutMs: number = 2000
): SpeechListener => {
    const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        throw new Error("Web Speech API is not supported in this browser.");
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    let wordTimeout: NodeJS.Timeout | null = null;

    const startListening = (
        onResult: (text: string) => void,
        onNoNewWord: () => void
    ): void => {
        recognition.start();

        recognition.onresult = (event: any): void => {
            let transcript = "";

            // Build the transcript from the current event
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + " ";
            }

            onResult(transcript.trim());

            // Reset the timeout when new words are detected
            if (wordTimeout) clearTimeout(wordTimeout);
            wordTimeout = setTimeout(() => {
                // console.log("No new word detected in the last 1 second.");
                onNoNewWord(); // Trigger the silence callback
                stopListening(); // Stop the recognition
            }, wordTimeoutMs);
        };

        recognition.onerror = (event: any): void => {
            console.error("Speech recognition error:", event.error);
            stopListening();
        };

        recognition.onend = (): void => {
            // console.log("Recognition ended.");
        };

        // Start the initial word timeout
        wordTimeout = setTimeout(() => {
            // console.log("No new word detected (initial timeout).");
            onNoNewWord();
            stopListening();
        }, wordTimeoutMs);
    };

    const stopListening = (): void => {
        recognition.onend = null; // Prevent auto-restart
        recognition.stop();

        if (wordTimeout) {
            clearTimeout(wordTimeout);
            wordTimeout = null;
        }
        // console.log("Stopped listening.");
    };

    return {
        startListening,
        stopListening,
    };
};


export default createSpeechListenerWithWordTimeout;
