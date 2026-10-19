// Calendar dates are stored without times: multiple hellos on one day count once.
const ContactHistory = (() => {
  const dayNumber = value => Date.parse(value + 'T00:00:00Z') / 86400000;
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(dayNumber(value)) && new Date(dayNumber(value) * 86400000).toISOString().slice(0, 10) === value;
  function normalize(friend) {
    const dates = Array.isArray(friend.history) ? friend.history : (friend.last ? [friend.last] : []);
    friend.history = [...new Set(dates.filter(validDate))].sort();
    friend.last = friend.history.at(-1) || '';
    return friend;
  }
  function add(friend, date) {
    normalize(friend);
    if (!validDate(date) || friend.history.includes(date)) return false;
    friend.history.push(date);
    normalize(friend);
    return true;
  }
  function remove(friend, date) {
    normalize(friend);
    friend.history = friend.history.filter(item => item !== date);
    normalize(friend);
  }
  function average(friend) {
    normalize(friend);
    const dates = friend.history;
    return dates.length < 2 ? null : (dayNumber(dates.at(-1)) - dayNumber(dates[0])) / (dates.length - 1);
  }
  return { normalize, add, remove, average };
})();
if (typeof module !== 'undefined') module.exports = ContactHistory;
