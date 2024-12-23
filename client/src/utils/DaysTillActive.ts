const DaysTillActive = (startDate: string): string => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const addOrdinalSuffix = (num: number): string => {
    if (num > 3 && num < 21) return `${num}th`;
    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate());

  const startDay = addOrdinalSuffix(start.getDate());

  const startMonth = months[start.getMonth()];

  return `${startDay} ${startMonth}`;
};

export default DaysTillActive;
