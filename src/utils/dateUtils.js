export const TIMEZONE = "America/Lima";

export const getTodayLimaISO = () => {
  const now = new Date();
  const options = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat("en-CA", options);
  return formatter.format(now);
};

export const getCurrentTimeLima = () => {
  const now = new Date();
  const options = {
    timeZone: TIMEZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(now);
};

export const combineDateWithCurrentTime = (dateString) => {
  if (!dateString) return new Date().toISOString();
  const timeString = getCurrentTimeLima();
  return `${dateString}T${timeString}`;
};

export const isValidActionDate = (actionDateString, creationDateString) => {
  if (!creationDateString) return true;

  const creationDatePart = creationDateString.split("T")[0];

  return actionDateString >= creationDatePart;
};

export const isFutureDate = (dateString) => {
  const todayLima = getTodayLimaISO();
  return dateString > todayLima;
};
