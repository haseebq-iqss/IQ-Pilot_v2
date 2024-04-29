// import React from "react";
// import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
// import { Box, Button, Modal, Popover, Typography } from "@mui/material";

// type EditDetailsModalProps = {
//   openMenu: boolean;
//   setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
//   handleClose: (e) => void;
// };
// const EditDetailsModal: React.FC<EditDetailsModalProps> = ({
//   openMenu,
//   setOpenMenu,
//   handleClose,
// }) => {
//   return (
//     <div style={{ position: "absolute", right: "10rem" }}>
//       <Popover
//         open={openMenu}
//         // anchorEl={anchorEl}
//         onClose={handleClose}
//         anchorOrigin={{
//           vertical: "center",
//           horizontal: "right",
//         }}
//         // transformOrigin={{
//         //   vertical: "top",
//         //   horizontal: "right",
//         // }}
//       >
//         <Typography>
//           <Button onClick={handleClose}>Edit</Button>
//         </Typography>
//         <Typography>
//           <Button onClick={handleClose}>Delete</Button>
//         </Typography>
//         <Typography>
//           <Button onClick={handleClose}>View Details</Button>
//         </Typography>
//       </Popover>
//     </div>
//   );
// };

// export default EditDetailsModal;
