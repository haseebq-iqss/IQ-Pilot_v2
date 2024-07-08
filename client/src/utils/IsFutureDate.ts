export default function IsFutureDate(dateStr: Date): boolean {
    const inputDate = new Date(dateStr);

    const today = new Date();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return inputDate >= todayEnd;
}