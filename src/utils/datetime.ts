export const DateFormatter = {
  getTimeDifference(createdDate: Date): string {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - createdDate.getTime()) / 1000);

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInMonth = 2592000;
    const secondsInYear = 31536000;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} วินาทีที่แล้ว`;
    } else if (diffInSeconds < secondsInHour) {
      const diffInMinutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInSeconds < secondsInDay) {
      const diffInHours = Math.floor(diffInSeconds / secondsInHour);
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else if (diffInSeconds < secondsInMonth) {
      const diffInDays = Math.floor(diffInSeconds / secondsInDay);
      return `${diffInDays} วันที่แล้ว`;
    } else if (diffInSeconds < secondsInYear) {
      const diffInMonths = Math.floor(diffInSeconds / secondsInMonth);
      return `${diffInMonths} เดือนที่แล้ว`;
    } else {
      const diffInYears = Math.floor(diffInSeconds / secondsInYear);
      return `${diffInYears} ปีที่แล้ว`;
    }
  },
  getTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  },
  getDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day < 10 ? "0" + day : day}/${
      month < 10 ? "0" + month : month
    }/${year}`;
  },
};
