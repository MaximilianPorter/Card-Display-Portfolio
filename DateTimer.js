function TimeSinceDate(date, decimalPlaces = 0) {
    const currentDate = new Date();
    const startDate = new Date(date);
    const timeDifference = currentDate - startDate;

    const years = timeDifference / (1000 * 60 * 60 * 24 * 365.25);
    if (decimalPlaces === 0) return Math.floor(years);

    return years.toFixed(decimalPlaces);
}

export default TimeSinceDate;
