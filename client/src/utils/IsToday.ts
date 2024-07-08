export default function IsToday(dateStr: Date): boolean {
    const inputDate = new Date(dateStr);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return inputDate >= todayStart && inputDate < todayEnd;
}