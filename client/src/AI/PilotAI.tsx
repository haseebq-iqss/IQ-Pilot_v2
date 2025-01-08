import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { ColFlex, RowFlex } from "../style_extentions/Flex";
import {
  ArrowDownward,
  Assistant,
  Send,
  StopCircle,
} from "@mui/icons-material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProcessPrompt } from "./ProcessPrompt";
import { Typewriter } from "react-simple-typewriter";
import { ExtractJSON } from "./JSONExtractor";
import { CommandInterface } from "../types/CommandInterface";
import ProcessCommand from "./CommandProcessor";
import TextToSpeech from "./PilotSpeechSynth";
import createSpeechListenerWithSilenceTimeout from "./VocalEngine";
import TalkingPilot from "./TalkingPilot";
import ListeningSound from "../assets/sounds/carbon.mp3";
import ListeningStoppedSound from "../assets/sounds/sound.mp3";

interface MessageInterface {
  id?: string;
  message: string;
  owner: "ai" | "user";
  typeOfMessage?: "prompt" | "action";
  timeStamp?: string;
}

interface PilotAIInterface {
  openDrawer: boolean;
  setOpenDrawer: (openDrawerState: boolean) => void;
  initialState?: {
    voiceActivated?: boolean;
    prompt?: string;
  };
}

function PilotAI({
  openDrawer,
  setOpenDrawer,
  initialState,
}: PilotAIInterface) {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [messageLockdown, setMessageLockdown] = useState<boolean>(false);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // Initialize Gemini
  const genAi = new GoogleGenerativeAI(GEMINI_API_KEY);
  const pilotAi = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Initialize TTS
  const tts = TextToSpeech.getInstance();
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Invokation Mode
  console.log(initialState);
  const [openTalkModal, setOpenTalkModal] = useState<boolean>(false);

  const PlaySound = (sound:string) => {
    const audio = new Audio(sound);
    audio.play();
  };

  useEffect(() => {
    if (initialState?.voiceActivated == true) {
      PlaySound(ListeningSound);
      // Adding an Aritificial Delay for UX
      const interval = setInterval(() => {
        setOpenTalkModal(true);
        StartListening();
        return clearInterval(interval);
      }, 1000);
      // setOpenDrawer(false);
    }
  }, [initialState]);

  async function GenerateContent(prompt: string) {
    try {
      const promptWithContext = await ProcessPrompt(prompt);
      const res = await pilotAi.generateContent(promptWithContext);
      // console.log(res)
      return res.response.text();
    } catch (err) {
      console.log(err);
      // Send a "Oops, i think somethings broken!" Message on error
      setMessages((prevMessages: MessageInterface[]) => [
        ...prevMessages,
        CreateMessage({
          message: "Oops, i think somethings broken! ",
          owner: "ai",
        }),
      ]);
      // Activate TTS
      tts.Speak("Oops, i think somethings broken!");
    }
  }

  const messageBoxRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const messageBox = messageBoxRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsAtBottom(true); // If it's visible in the viewport, update the state
        }
      },
      {
        root: null, // Observe relative to the viewport
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }

    // Also check if user is scrolled to the bottom
    const checkScrollPosition = () => {
      if (
        messageBox &&
        messageBox.scrollTop + messageBox.clientHeight >=
          messageBox.scrollHeight - 5
      ) {
        setIsAtBottom(true); // Near bottom
      } else {
        setIsAtBottom(false); // Not at bottom
      }
    };

    // Initial check
    checkScrollPosition();
    // Add scroll listener
    messageBox?.addEventListener("scroll", checkScrollPosition);

    // Cleanup
    return () => {
      observer.disconnect();
      messageBox?.removeEventListener("scroll", checkScrollPosition);
    };
  }, [messages]);

  // Data Structure For Message
  const CreateMessage = ({
    message,
    owner,
    typeOfMessage,
  }: MessageInterface): MessageInterface => {
    const uid = owner + "_" + Math.trunc(Math.random() * 1000000);
    const newMessage: MessageInterface = {
      id: uid,
      message,
      owner,
      typeOfMessage: typeOfMessage ? typeOfMessage : "prompt",
      timeStamp: String(Date.now()),
    };

    return newMessage;
  };

  // Send Prompt to AI
  async function SendMessage(prompt: string, owner: "ai" | "user") {
    const message: MessageInterface = CreateMessage({
      message: prompt,
      owner,
    });

    setMessages((prevMessages: MessageInterface[]) => [
      ...prevMessages,
      message,
    ]);

    if (owner === "user") {
      // Lock the send button
      setMessageLockdown(true);
      setPrompt("");
      scrollToBottom();
    }

    if (owner === "user") {
      // Send to AI & Capture the response
      const response: string | undefined = await GenerateContent(prompt);

      // Convert Response into Usable JSON
      // console.log(response);
      const responseCommand: CommandInterface = ExtractJSON(response as string);
      // console.log(responseCommand)

      // Check command type
      if (responseCommand?.type == "message") {
        // Send the AI response back as a new message
        tts.Speak(responseCommand?.message as string);
        setMessages((prevMessages: MessageInterface[]) => [
          ...prevMessages,
          CreateMessage({
            message: responseCommand?.message as string,
            owner: "ai",
          }),
        ]);
      } else {
        // Send a "Working on it" Message
        setMessages((prevMessages: MessageInterface[]) => [
          ...prevMessages,
          CreateMessage({
            message: "Sure, Working on it ✈️",
            owner: "ai",
          }),
        ]);
        // Activate TTS
        tts.Speak("Sure, Working on it");
        // Create a Artificial Delay for UX
        const artificialDelayTOut: NodeJS.Timeout = setInterval(() => {
          // Close AI for a Clean Transition
          setOpenDrawer(false);
          // Process the command
          ProcessCommand(responseCommand);
          return clearInterval(artificialDelayTOut);
        }, 2000);
      }
    }

    // Unlock the send button after AI response is added
    setMessageLockdown(false);
    return;
  }

  // Stop TTS Speaking
  const StopSpeaking = () => {
    tts.Stop();
    setIsSpeaking(false);
  };

  const [listening, isListening] = useState<boolean>(false);
  const { startListening, stopListening } =
    createSpeechListenerWithSilenceTimeout("en-US");

  // Function to use Voice to interact with Pilot AI
  const StartListening = () => {
    // Start listening dynamically
    isListening(true);
    let latestText: string;
    startListening(
      (text) => {
        latestText = text;
        setPrompt(text);
      },
      () => {
        // Trigger SendMessage with the latest `text` directly
        if (latestText?.length) {
          SendMessage(latestText, "user");
          stopListening();
          if (!openTalkModal) {
            PlaySound(ListeningStoppedSound);
          }
          setOpenTalkModal(false);
        }
        isListening(false);
        setOpenTalkModal(false);
      }
    );
  };

  // Enter Listener to Send Prompt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
        e.preventDefault();
        if (prompt.length > 0 && !messageLockdown) {
          SendMessage(prompt, "user");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup / Unmounting Listner
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prompt]);

  useEffect(() => {
    // Polling every 500ms to check the speaking status.
    const interval = setInterval(() => {
      const status = tts.Status();
      setIsSpeaking(status);
    }, 500);

    // Clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, [tts]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Startup Effects

  return (
    <Drawer
      anchor={"right"}
      open={openDrawer}
      onClose={() => setOpenDrawer(!openDrawer)}
    >
      <Box
        sx={{
          ...ColFlex,
          alignItems: "flex-start",
          width: "30vw",
          height: "100%",
          backgroundColor: "background.default",
          p: 2.5,
        }}
      >
        {/* AI IMAGE */}
        <Box
          sx={{
            position: "absolute",
            ...RowFlex,
            width: "90%",
            height: "90%",
          }}
        >
          <Box
            component={"img"}
            sx={{ width: "75px", height: "auto" }}
            src="/images/logo-pilot-ai.png"
          />
        </Box>

        {/* Messages Box Container */}
        <Box
          ref={messageBoxRef}
          sx={{
            mb: 5,
            width: "100%",
            height: "90%",
            overflowY: "scroll",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {/* Messages Box */}
          <Box
            sx={{
              ...ColFlex,
              gap: 2.5,
              alignItems: "flex-end",
              // justifyContent: "flex-end",
              transition: "all 1s",
              width: "100%",
              // height: "100%",
            }}
          >
            {messages?.map((messageBody: MessageInterface, index: number) => {
              return (
                <Box
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={"fade-slide-in"}
                  key={messageBody.id}
                  sx={{
                    minWidth: "50px",
                    maxWidth: "350px",
                    mr: messageBody?.owner == "user" ? "none" : "auto",
                    px: 1,
                    py: 0.5,
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderRadius: 2,
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      ...RowFlex,
                      justifyContent: "space-between",
                      alignItems: "center",
                      lineHeight: "auto",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        ...(messageBody?.owner === "ai" && {
                          background:
                            "linear-gradient(90deg, #FF4500, #9329FC)", // Gradient for AI messages
                          WebkitBackgroundClip: "text", // Clips background to text
                          WebkitTextFillColor: "transparent", // Allows gradient to show through
                        }),
                      }}
                    >
                      {messageBody?.owner == "user" ? "You" : "Pilot AI"}
                    </Typography>
                    {isSpeaking &&
                      messageBody.owner == "ai" &&
                      index == messages.length - 1 && (
                        <LinearProgress
                          className={"size-change-infinite"}
                          color="inherit"
                          sx={{ width: "20px", height: "10px" }}
                        />
                      )}
                  </Box>

                  <Typography variant="body1">
                    {messageBody?.owner == "user" ? (
                      messageBody?.message
                    ) : (
                      <Typewriter
                        words={[messageBody?.message]}
                        typeSpeed={10}
                        loop={1}
                        cursor={true}
                        cursorBlinking={false}
                        cursorStyle={"✨"}
                        onType={() => scrollToBottom()}
                      />
                    )}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        {/* Prompt fields */}
        <Box sx={{ width: "100%", mt: "auto" }}>
          <TextField
            disabled={messageLockdown}
            fullWidth
            multiline
            spellCheck={true}
            name="prompt"
            label="Message Pilot AI"
            placeholder="Ask Pilot AI"
            value={prompt}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setPrompt(e.target.value)}
            autoFocus
            InputProps={{
              endAdornment: (
                <>
                  <IconButton
                    className={messageLockdown ? "size-change-infinite" : ""}
                    disabled={messageLockdown}
                    onClick={() => StartListening()}
                  >
                    {listening ? (
                      <Box
                        className={"size-change-infinite"}
                        sx={{
                          width: "12.5px",
                          height: "12.5px",
                          borderRadius: 100,
                          backgroundColor: "limegreen",
                        }}
                      />
                    ) : (
                      <Assistant />
                    )}
                  </IconButton>
                  <IconButton
                    className={messageLockdown ? "size-change-infinite" : ""}
                    disabled={messageLockdown}
                    onClick={() =>
                      !isSpeaking
                        ? prompt?.length && SendMessage(prompt, "user")
                        : StopSpeaking()
                    }
                  >
                    {messageLockdown ? (
                      <CircularProgress size={20} />
                    ) : isSpeaking ? (
                      <StopCircle />
                    ) : (
                      <Send />
                    )}
                  </IconButton>
                </>
              ),
            }}
          ></TextField>
        </Box>
        {!isAtBottom && messages.length > 0 && (
          <IconButton
            className="fade-in-up"
            onClick={() => scrollToBottom()}
            sx={{
              position: "absolute",
              alignSelf: "center",
              bottom: "15%",
              backgroundColor: "#212A3B",
              zIndex: 99,
            }}
          >
            <ArrowDownward />
          </IconButton>
        )}
      </Box>
      {/* Pilot Live Talking Interface */}
      <TalkingPilot
        openTalkModal={openTalkModal}
        setOpenTalkModal={setOpenTalkModal}
        prompt={prompt}
      />
    </Drawer>
  );
}

export default PilotAI;
