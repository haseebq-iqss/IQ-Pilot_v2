const DaysTillActive = (startDate: string, daysTillActive: number): string => {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const addOrdinalSuffix = (num: number): string => {
        if (num > 3 && num < 21) return `${num}th`;
        switch (num % 10) {
            case 1: return `${num}st`;
            case 2: return `${num}nd`;
            case 3: return `${num}rd`;
            default: return `${num}th`;
        }
    };

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + daysTillActive);

    const startDay = addOrdinalSuffix(start.getDate());
    const endDay = addOrdinalSuffix(end.getDate());

    const startMonth = months[start.getMonth()];
    const endMonth = months[end.getMonth()];

    if (startMonth === endMonth) {
        return `${startDay} to ${endDay} ${startMonth}`;
    } else {
        return `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
    }
};

export default DaysTillActive;