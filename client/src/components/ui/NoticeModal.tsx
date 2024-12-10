import { Modal, Box, Typography, Button } from "@mui/material";
import { ColFlex } from "../../style_extentions/Flex";

interface NoticeModal {
  openConfirmModal: boolean;
  setOpenConfirmModal: (openConfirmModal: boolean) => void;
  triggerFunction: () => void;
  headerText: string;
  subHeaderText: string;
}

function NoticeModal({
  openConfirmModal,
  setOpenConfirmModal,
  triggerFunction,
  headerText,
  subHeaderText,
}: NoticeModal) {
  return (
    <Modal
      sx={{ ...ColFlex, width: "100%", height: "100%" }}
      open={openConfirmModal}
      onClose={() => setOpenConfirmModal(false)}
    >
      <Box
        sx={{
          ...ColFlex,
          p: "30px 10px",
          width: { xs: "90%", lg: "35%" },
          borderRadius: "10px",
          gap: 5,
          alignItems: "center",
          textAlign: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
          boxShadow: "0px 10px 100px rgba(0 255 251 / 0.2)",
        }}
      >
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            textAlign: "center",
            gap: "2rem",
            marginTop: "15px",
          }}
        >
          {/* <Warning
            sx={{ width: "50px", height: "50px", color: "warning.main" }}
          /> */}

          <Box sx={{ ...ColFlex, gap: 1 }}>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ mb: "10px", color: "text.primary" }}
            >
              {headerText}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", width: "80%" }}
            >
              {subHeaderText}
            </Typography>
          </Box>

          <Box sx={{ gap: 5, ...ColFlex }}>
            <Button
              sx={{
                backgroundColor: "success.dark",
                color: "white",
                padding: "10px 50px",
              }}
              variant="contained"
              size="large"
              onClick={() => {
                triggerFunction();
                setOpenConfirmModal(false);
              }}
            >
              OK
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default NoticeModal;
