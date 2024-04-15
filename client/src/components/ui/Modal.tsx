import { Clear } from "@mui/icons-material";
import { Box, Divider, Modal, Typography } from "@mui/material";
import { ReactNode } from "react";
import isXSmall from "../../utils/isXSmall";
import { ColFlex } from "../../style_extentions/Flex";

type ModalPropTypes = {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  headerText: string;
  children: ReactNode;
};

export default function GlobalModal({
  openModal = false,
  setOpenModal,
  headerText,
  children,
}: ModalPropTypes) {
  const { isXS } = isXSmall();
  return (
    <>
      <Modal
        sx={{ ...ColFlex, width: "100%", height: "100%" }}
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
      >
        <Box
          sx={{
            ...ColFlex,
            p: { xs: 1, lg: 2.5 },
            minHeight: "50vh",
            width: { xs: "100%", lg: "75%" },
            borderRadius: "5px",
            gap: 1,
            alignItems: "flex-start",
            justifyContent: "flex-start",
            backgroundColor: "background.default",
          }}
        >
          {/* MODAL HEADER */}
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              p: 1,
              pr: { xs: 1, lg: 2.5 },
            }}
          >
            <Typography
              color="text.primary"
              fontWeight={600}
              variant={isXS ? "h5" : "h4"}
            >
              {headerText}
            </Typography>
            <Clear
              sx={{ cursor: "pointer", color: "text.primary" }}
              onClick={() => setOpenModal(!openModal)}
              fontSize={"large"}
            />
          </Box>
          <Divider sx={{ width: "100%" }} />
          {/* MODAL BODY */}
          <>{children}</>
        </Box>
      </Modal>
    </>
  );
}
