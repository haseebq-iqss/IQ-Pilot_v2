function Convert24To12HourFormat(timeRange: string): string {
    const convertTime = (time: string): string => {
        const [hour, minute] = time.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    const [startTime, endTime] = timeRange.split('-');
    const start12Hour = convertTime(startTime);
    const end12Hour = convertTime(endTime);

    return `${start12Hour} - ${end12Hour}`;
}

export default Convert24To12HourFormat