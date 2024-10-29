import React from "react";
import Badge from "@mui/material/Badge";
import { PickersDay, DateCalendar } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

interface AttendanceCalendarProps {
  highlightDates: string[]; // Array of date strings in ISO format
}

const HighlightedDay: React.FC<{
  day: Dayjs;
  outsideCurrentMonth: boolean;
  highlightDates: string[];
}> = ({ day, outsideCurrentMonth, highlightDates }) => {
  const isSelected = highlightDates.some((date) =>
    day.isSame(dayjs(date), "day")
  );

  return (
    <Badge overlap="circular" badgeContent={isSelected ? "❌" : undefined}>
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        onDaySelect={() => {
          console.log("Function not implemented.");
        }}
        isFirstVisibleCell={false}
        isLastVisibleCell={false}
      />
    </Badge>
  );
};

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  highlightDates,
}) => {
  return (
    <DateCalendar
      slots={{
        day: (props) => (
          <HighlightedDay {...props} highlightDates={highlightDates} />
        ),
      }}
      sx={{ width: "100%", height: "100%" }}
    />
  );
};

export default AttendanceCalendar;
