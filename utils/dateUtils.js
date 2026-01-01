const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function getMonthYearOffset(baseDate, offset) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + offset);
  return {
    monthIndex: d.getMonth(),          // 0–11
    monthName: MONTHS[d.getMonth()],   // "OCT"
    year: d.getFullYear(),
  };
}

module.exports = { getMonthYearOffset };
