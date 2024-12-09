import { Upload } from "@mui/icons-material";
import { Button } from "@mui/material";
import useAxios from "../api/useAxios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import SnackbarContext from "./../context/SnackbarContext";
import { SnackBarContextTypes } from "../types/SnackbarTypes";
// import * as XLSX from "xlsx";

function UploadNewTMDataButton() {
  const qc = useQueryClient();
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const bulkUploadMF = (bulkUploadData: any) => {
    return useAxios.post("users/upload-emp-leave-excel", bulkUploadData);
  };

  const { mutate: bulkUploadMutation, status: _bulkUploadStatus } = useMutation(
    {
      mutationFn: bulkUploadMF,
      onSuccess: (data) => {
        console.log(data);
        setOpenSnack({
          open: true,
          message: data.data.message,
          severity: "success",
        });
        qc.invalidateQueries({ queryKey: ["all-teamMembers"] });
        // ["all-teamMembers"]
        // navigate(-1);
      },
      onError: () => {
        setOpenSnack({
          open: true,
          message: "Something went wrong!",
          severity: "error",
        });
      },
    }
  );
  // const [jsonData, setJsonData] = useState(null);
  const BulkDataUploader = (event: any) => {
    const docFile = event.target.files[0];
    if (!docFile) return;
  
    // Wrap the file in FormData
    const formData = new FormData();
    formData.append("file", docFile);
  
    // Log for debugging
    console.log("FormData:", formData.get("file"));
  
    // Use the mutation to upload
    bulkUploadMutation(formData);
  };
  

  return (
    <Button
      component="label"
      sx={{
        backgroundColor: "primary.main",
        color: "text.primary",
        borderRadius: "4px",
        px: 2.5,
        width: "15rem",
        display: "flex",
        alignItems: "center",
        mr: 2.5,
      }}
    >
      <input
        onChange={BulkDataUploader}
        type="file"
        // accept="image/png, image/gif, image/jpeg"
        hidden
        name="profilePicture"
      />
      <Upload sx={{ mr: 1 }} />
      New TM Data
    </Button>
  );
}

export default UploadNewTMDataButton;
