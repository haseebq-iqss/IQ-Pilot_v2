import RequestShift from "../actions/RequestShift"
import { CommandInterface } from "../types/CommandInterface"

async function ProcessCommand(command: CommandInterface) {
  // Check Action Type, URL Existance, & window.Navigator Existance
  if (command?.action == "navigate" && command?.data?.url && window.navigateApp) {
    window.navigateApp(command?.data?.url)
  }
  else {
    window.openSnackbar({
      open:true,
      message:"Processing",
      severity:"info",
    })
    if (command.data?.action_name == "create_shift") {
      const shiftData = {
        currentShift: command.data.args?.ShiftTime,
        typeOfRoute: command.data.args?.ShiftType,
        workLocation: command.data.args?.WorkLocation,
      }
      await RequestShift(shiftData)
    }
  }
  return command
}

export default ProcessCommand