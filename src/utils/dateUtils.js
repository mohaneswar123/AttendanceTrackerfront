// src/utils/dateUtils.js
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US').format(new Date(date));
};

export const isToday = (date) => {
  const today = new Date();
  const givenDate = new Date(date);
  return today.getFullYear() === givenDate.getFullYear() &&
         today.getMonth() === givenDate.getMonth() &&
         today.getDate() === givenDate.getDate();
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end - start;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};