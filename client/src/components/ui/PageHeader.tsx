import { Typography } from "@mui/material";
import { ReactNode } from "react";

function PageHeader({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h4" fontWeight={700}>
      {children}
    </Typography>
  );
}

export default PageHeader;
