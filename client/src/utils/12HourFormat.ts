const ConvertTo12HourFormat = (time24: string, mode: string = "pickup"): string => {
  const formatTime = (hour24: number, minute: number): string => {
    let hour12: number;
    let period: string;

    if (hour24 === 0) {
      hour12 = 12;
      period = "AM";
    } else if (hour24 === 12) {
      hour12 = 12;
      period = "PM";
    } else if (hour24 > 12) {
      hour12 = hour24 - 12;
      period = "PM";
    } else {
      hour12 = hour24;
      period = "AM";
    }

    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const [startTime, endTime] = time24.split("-");
  if (mode === "drop") {
    const [endHour, endMinute] = endTime.split(":").map(Number);
    return formatTime(endHour, endMinute);
  } else {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    return formatTime(startHour, startMinute);
  }
};

export default ConvertTo12HourFormat;
