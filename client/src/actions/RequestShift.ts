import useAxios from "../api/useAxios"

async function RequestShift(shiftArgs: any) {
  try {

    const shiftData = await useAxios.post("/routes/createShiftK-Means", shiftArgs);
    if (window.navigateApp) {
      window.navigateApp("/admin/createShift", { state: { data: shiftData.data, centralPoint: "NOT SET" } })
    }
  } catch (err) {
    window.openSnackbar({
      open: true,
      message: (err as any)?.response?.data?.message,
      severity: "error",
    })
  }
}

export default RequestShift