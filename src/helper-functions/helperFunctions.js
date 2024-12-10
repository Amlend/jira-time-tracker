export default function helperFunction() {
  const isValidTimeInput = (evt) => {
    const keysAllowed = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "h",
      "m",
      " ",
      ".",
      "Backspace",
    ];
    if (!keysAllowed.includes(evt.key)) evt.preventDefault();
  };

  const formatTimeInput = (input) => {
    input = input.replace(/h{2,}/g, "h");
    input = input.replace(/m{2,}/g, "m");
    let hours = 0,
      minutes = 0;
    input.split(" ").forEach((part) => {
      if (part.includes("h")) {
        let [hourPart, minFraction] = part
          .replace("h", "")
          .split(".")
          .map(Number);
        hours += hourPart || 0;
        if (minFraction)
          minutes += (minFraction > 10 ? minFraction % 10 : minFraction) * 6;
      }
      if (part.includes("m")) {
        minutes += parseInt(part.replace("m", "")) || 0;
      }
    });
    while (minutes >= 60) {
      hours++;
      minutes -= 60;
    }
    return `${hours ? hours + "h" : ""} ${minutes ? minutes + "m" : ""}`.trim();
  };

  const convertMinutesToHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours ? hours + "h" : ""} ${
      remainingMinutes ? remainingMinutes + "m" : ""
    }`.trim();
  };

  const convertBackToMinutes = (data) => {
    let logTime = data.split(" ");
    let logTimeInMin = 0;
    for (let i = 0; i < logTime.length; i++) {
      if (logTime[i].includes("h"))
        logTimeInMin += Number(logTime[i].replace("h", "")) * 60;
      else if (logTime[i].includes("m"))
        logTimeInMin += Number(logTime[i].replace("m", ""));
      else return;
    }
  };
  return {
    isValidTimeInput,
    formatTimeInput,
    convertMinutesToHoursAndMinutes,
    convertBackToMinutes,
  };
}
