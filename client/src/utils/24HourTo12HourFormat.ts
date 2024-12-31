function Convert24To12HourFormat(timeRange: string): string {
    const isValidTime = (time: string): boolean => {
        const [hour, minute] = time.split(':').map(Number);
        return (
            !isNaN(hour) && !isNaN(minute) && 
            hour >= 0 && hour < 24 && 
            minute >= 0 && minute < 60
        );
    };

    const convertTime = (time: string): string => {
        const [hour, minute] = time.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    if (!timeRange || typeof timeRange !== 'string') {
        return timeRange; // Return the original string if the input is invalid
    }

    const [startTime, endTime] = timeRange.split('-');

    if (!startTime || !endTime) {
        return timeRange; // Return the original string if start or end time is missing
    }

    if (!isValidTime(startTime.trim()) || !isValidTime(endTime.trim())) {
        return timeRange; // Return the original string if the times are invalid
    }

    const start12Hour = convertTime(startTime.trim());
    const end12Hour = convertTime(endTime.trim());

    return `${start12Hour} - ${end12Hour}`;
}

export default Convert24To12HourFormat;
