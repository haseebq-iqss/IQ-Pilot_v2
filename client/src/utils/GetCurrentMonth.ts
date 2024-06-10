function GetCurrentMonth(): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const now = new Date();
    const currentMonthIndex = now.getMonth();
  
    return monthNames[currentMonthIndex];
  }
  
export default GetCurrentMonth