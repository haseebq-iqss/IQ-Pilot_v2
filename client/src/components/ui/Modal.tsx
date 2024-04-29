import { Clear } from "@mui/icons-material";
import { Box, Divider, Modal, Typography } from "@mui/material";
import { ReactNode } from "react";
import isXSmall from "../../utils/isXSmall";
import { ColFlex } from "../../style_extentions/Flex";

type ModalPropTypes = {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  headerText: string;
  subHeading?: string;
  children: ReactNode;
};

export default function GlobalModal({
  openModal = false,
  setOpenModal,
  headerText,
  subHeading,
  children,
}: ModalPropTypes) {
  const { isXS } = isXSmall();
  return (
    <>
      <Modal
        sx={{ ...ColFlex, height: "100%" }}
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
      >
        <Box
          sx={{
            ...ColFlex,
            p: { xs: 1, lg: 2.5 },
            minHeight: "50vh",
            width: { xs: "100%", lg: "60%" },
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
            <Box
              sx={{
                ...ColFlex,
                gap: "0.5rem",
              }}
            >
              <Typography
                color="text.primary"
                fontWeight={600}
                variant={isXS ? "h5" : "h4"}
              >
                {headerText}
              </Typography>
              <Typography
                color="text.secondary"
                fontWeight={600}
                variant={isXS ? "h5" : "h4"}
                sx={{ fontSize: "15px", color: "#BBBBBB" }}
              >
                {subHeading}
              </Typography>
            </Box>
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
