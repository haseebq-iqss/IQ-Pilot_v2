export default function GetArrivalTime(time: string, index: number): string {
    // Splitting the time string to extract hours and minutes
    const [hours, minutes] = time.split(':').map(Number);
    
    // Subtracting minutes
    const totalMinutes = hours * 60 + minutes - (10 * index);
    
    // Calculating hours and minutes after subtraction
    let newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    // Converting 24-hour format to 12-hour format
    let period = 'AM';
    if (newHours >= 12) {
        period = 'PM';
        if (newHours > 12) {
            newHours -= 12;
        }
    }
    if (newHours === 0) {
        newHours = 12;
    }
    
    // Formatting the result
    const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')} ${period}`;
    
    return newTime;
}
