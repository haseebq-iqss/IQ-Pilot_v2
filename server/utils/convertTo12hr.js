const ConvertShiftTimeTo12HrFormat = (time24, mode = "pickup") => {
  const formatTime = (hour24, minute) => {
    let hour12;
    let period;

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

module.exports = ConvertShiftTimeTo12HrFormat;
