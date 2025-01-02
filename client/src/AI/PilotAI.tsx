import { Box, Drawer, IconButton, TextField, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../style_extentions/Flex";
import { Send } from "@mui/icons-material";
import { useEffect, useState } from "react";

interface MessageInterface {
  id?: string;
  message: string;
  owner: "ai" | "user";
  typeOfMessage?: "prompt" | "action";
  timeStamp?: string;
}

function PilotAI({ openDrawer, setOpenDrawer }: any) {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<MessageInterface[]>([]);

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

  async function SendMessage(prompt: string, owner: "ai" | "user") {
    const message: MessageInterface = CreateMessage({
      message: prompt,
      owner,
    });
    setMessages((prevMessages: MessageInterface[]) => [
      ...prevMessages,
      message,
    ]);
    if (owner == "user") {
      setPrompt("");
    }
    // Send to AI
    // Capture the response
    // Recall the Send Message

    return;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
        e.preventDefault();
        if (prompt.length > 0) {
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
          sx={{
            width: "100%",
            height: "90%",
            overflowY: "scroll",
            scrollbarWidth: "none", // For Firefox
            "&::-webkit-scrollbar": {
              display: "none", // For Chrome, Safari, Edge
            },
          }}
        >
          {/* Messages Box */}
          <Box
            sx={{
              ...ColFlex,
              gap: 2.5,
              alignItems: "flex-end",
              justifyContent: "flex-end",
              transition: "all 1s",
              width: "100%",
              height: "100%",
            }}
          >
            {messages?.map((messageBody: MessageInterface) => {
              return (
                <Box
                  className={"fade-slide-in"}
                  key={messageBody.id}
                  sx={{
                    minWidth: "50px",
                    maxWidth: "250px",
                    mr: messageBody?.owner == "user" ? "none" : "auto",
                    px: 1,
                    py: 0.5,
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderRadius: 2,
                    zIndex: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {messageBody?.owner == "user" ? "You" : "Pilot AI"}
                  </Typography>
                  <Typography variant="body1">
                    {messageBody?.message}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        {/* Prompt fields */}
        <Box sx={{ width: "100%", mt: "auto" }}>
          <TextField
            fullWidth
            name="prompt"
            label="Message Pilot AI"
            placeholder="Ask Pilot AI"
            value={prompt}
            // InputLabelProps={{ shrink: true }}
            onChange={(e) => setPrompt(e.target.value)}
            autoFocus
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => SendMessage(prompt, "user")}>
                  <Send />
                </IconButton>
              ),
            }}
          ></TextField>
        </Box>
      </Box>
    </Drawer>
  );
}

export default PilotAI;
