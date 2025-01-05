import useAxios from "../api/useAxios";

function getFormattedFileName() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so add 1
    const year = today.getFullYear();

    // Construct the file name with the day-first format
    return `iQSS-Team Route Planning (${day}/${month}/${year}).xlsx`;
}

async function ExportRoster() {
    const excelFileRaw = await useAxios.get("/routes/exports/shifts-data", {
        responseType: "arraybuffer", // Ensure data is received as an ArrayBuffer
    });

    if (excelFileRaw) {
        // Create a Blob from the ArrayBuffer data
        const blob = new Blob([excelFileRaw as unknown as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = getFormattedFileName();
        link.setAttribute("download", fileName); // File name for the download
        // link.setAttribute("download", "iQSS-Team Route Planning (10/01).xlsx"); // File name for the download
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link); // Clean up the link
    }
}

export default ExportRoster