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
  // Si no hay fecha, usamos el momento actual completo
  if (!dateString) return new Date().toISOString();

  const timeString = getCurrentTimeLima();

  // Agregamos explícitamente el offset de Perú (-05:00)
  // Esto asegura que PostgreSQL guarde el UTC correcto.
  return `${dateString}T${timeString}-05:00`;
};

/**
 * Extrae la parte de la fecha (YYYY-MM-DD) de un ISO string,
 * pero respetando la zona horaria de Lima.
 * Soluciona el bug donde 22:00 PM (Peru) se convertía en el día siguiente (UTC).
 */
export const getLimaDateFromISO = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const options = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  // en-CA devuelve formato YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", options).format(date);
};

export const isValidActionDate = (actionDateString, creationDateString) => {
  if (!creationDateString) return true;

  // CORRECCIÓN: Usar getLimaDateFromISO en lugar de split("T")[0]
  // para evitar que las horas UTC muevan la fecha al día siguiente.
  const creationDatePart = getLimaDateFromISO(creationDateString);

  return actionDateString >= creationDatePart;
};

export const isFutureDate = (dateString) => {
  const todayLima = getTodayLimaISO();
  return dateString > todayLima;
};

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato visual (DD/MM/YYYY)
 * Útil para mensajes de error y visualización en UI.
 */
export const formatDateForDisplay = (isoDateString) => {
  if (!isoDateString) return "";
  const [year, month, day] = isoDateString.split("-");
  return `${day}/${month}/${year}`;
};
