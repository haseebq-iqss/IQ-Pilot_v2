import useAxios from "../api/useAxios"

async function RequestShift(shiftArgs: any) {
  const shiftData = await useAxios.post("/routes/createShiftK-Means", shiftArgs);
  if (window.navigateApp) {
    window.navigateApp("/admin/createShift", { state: { data: shiftData.data, centralPoint: "NOT SET" } })
  }
}

export default RequestShift