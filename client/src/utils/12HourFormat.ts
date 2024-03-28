const ConvertTo12HourFormat = (time24: string): string => {
    const [hourStr, minuteStr] = time24.split(':');
    const hour24 = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
        throw new Error('Invalid time');
    }

    let hour12: number;
    let period: string;

    if (hour24 === 0) {
        hour12 = 12;
        period = 'AM';
    } else if (hour24 === 12) {
        hour12 = 12;
        period = 'PM';
    } else if (hour24 > 12) {
        hour12 = hour24 - 12;
        period = 'PM';
    } else {
        hour12 = hour24;
        period = 'AM';
    }

    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default ConvertTo12HourFormat;
