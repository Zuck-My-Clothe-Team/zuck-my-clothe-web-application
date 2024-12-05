export const DateFormatter = {
  getTimeDifference(firstDate: Date, endDate: Date): string {
    const diffInSeconds = Math.floor(
      (endDate.getTime() - firstDate.getTime()) / 1000
    );

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInMonth = 2592000;
    const secondsInYear = 31536000;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} วินาที`;
    } else if (diffInSeconds < secondsInHour) {
      const diffInMinutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${diffInMinutes} นาที`;
    } else if (diffInSeconds < secondsInDay) {
      const diffInHours = Math.floor(diffInSeconds / secondsInHour);
      return `${diffInHours} ชั่วโมง`;
    } else if (diffInSeconds < secondsInMonth) {
      const diffInDays = Math.floor(diffInSeconds / secondsInDay);
      return `${diffInDays} วัน`;
    } else if (diffInSeconds < secondsInYear) {
      const diffInMonths = Math.floor(diffInSeconds / secondsInMonth);
      return `${diffInMonths} เดือน`;
    } else {
      const diffInYears = Math.floor(diffInSeconds / secondsInYear);
      return `${diffInYears} ปี`;
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
  getDateTime(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${day < 10 ? "0" + day : day}/${
      month < 10 ? "0" + month : month
    }/${year} ${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  },
  getDateTimeThaiFomatted(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543;
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    return `${day} ${thaiMonths[month]} ${year} เวลา ${hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }`;
  },
  getDateThaiFomatted(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543;

    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    return `${day} ${thaiMonths[month]} ${year}`;
  },
};
