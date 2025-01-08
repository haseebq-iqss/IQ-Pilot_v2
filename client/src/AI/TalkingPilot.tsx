import { Modal, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../style_extentions/Flex";

interface TalkingPilotInterface {
  openTalkModal: boolean;
  setOpenTalkModal: (state: boolean) => void;
  prompt: string;
}

function TalkingPilot({ openTalkModal, prompt }: TalkingPilotInterface) {
  return (
    <Modal
      open={openTalkModal}
      sx={{ ...ColFlex, alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          ...ColFlex,
          p: { xs: 1, lg: 2.5 },
          minHeight: { lg: "35vh", xs: "50vh" },
          width: { xs: "100%", lg: "60%" },
          borderRadius: "5px",
          gap: 5,
          alignItems: "center",
          justifyContent: "center",
          color: "text.primary",
          backgroundColor: "background.default",
        }}
      >
        <Box
          className={"ai-listening"}
          component={"img"}
          src="/images/ai-listening.gif"
          sx={{ width: "100px", aspectRatio: 1, borderRadius: 100 }}
        />
        <Typography>{prompt}</Typography>
        {/* Listening Indicator */}
        <Box sx={{ ...RowFlex, gap: 1 }}>
          <Box
            className={"size-change-infinite"}
            sx={{
              width: "10px",
              height: "10px",
              borderRadius: 100,
              backgroundColor: "limegreen",
            }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Pilot is listening
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}

export default TalkingPilot;
