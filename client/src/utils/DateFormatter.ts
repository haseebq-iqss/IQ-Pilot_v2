function getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return 'th'; // Special case for teens
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

function formatDateString(dateString: string, withYear?: boolean) {
    const date = new Date(dateString);

    if (isToday(date)) {
        return "Today";
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Tue"
    const monthName = date.toLocaleDateString('en-US', { month: 'short' }); // e.g., "May"
    const day = date.getDate(); // e.g., 17
    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`; // e.g., "17th"

    // Construct the return string conditionally based on withYear
    return withYear
        ? `${dayName}, ${dayWithSuffix} of ${monthName} - ${date.getFullYear().toString()}` // e.g., "Tue, 17th of May 24"
        : `${dayName}, ${dayWithSuffix} of ${monthName}`; // e.g., "Tue, 17th of May"
}

export default formatDateString;
