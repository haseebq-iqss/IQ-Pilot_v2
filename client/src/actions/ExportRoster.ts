import useAxios from "../api/useAxios";

function getFormattedFileName() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = today.getFullYear();

    return `iQSS-Team Route Planning (${day}-${month}-${year}).xlsx`; // Use a consistent format
}

async function ExportRoster() {
    try {
        // Fetch the Excel file from the server
        const response = await useAxios.get("/routes/exports/shifts-data", {
            responseType: "arraybuffer", // Ensure binary data is received
        });

        // Check if the response is valid
        if (response && response.data) {
            // Create a Blob from the ArrayBuffer data
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Generate a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create an anchor element for download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", getFormattedFileName()); // Set the file name
            document.body.appendChild(link);
            link.click();

            // Clean up the URL and link element
            window.URL.revokeObjectURL(url);
            link.remove();
        } else {
            console.error("Failed to fetch Excel data: Empty response.");
        }
    } catch (error) {
        console.error("Error while exporting roster:", error);
    }
}

export default ExportRoster;
