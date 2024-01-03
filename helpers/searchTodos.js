const moment = require("moment-timezone");

const isDateInRange = (date, startDate, endDate) => {
  const momentDate = moment(date, "DD.MM.YYYY", true);
  const momentStartDate = moment(startDate, "DD.MM.YYYY", true);
  const momentEndDate = moment(endDate, "DD.MM.YYYY", true);

  return momentDate.isBetween(momentStartDate, momentEndDate, null, "[]");
};

const searchTodos = (searchData, todos) => {
  const lowerCaseSearchPhrase = searchData.searchByPhrase?.toLowerCase();
  const currentDate = moment();

  let filteredTodos = todos.filter((task) => {
    // 1) Пошук за датою
    if (
      searchData.searchByDate &&
      !isDateInRange(searchData.searchByDate, task.dateFrom, task.dateTo)
    ) {
      return false;
    }

    // 2) Пошук за розділом
    if (searchData.searchByPart && task.part !== searchData.searchByPart) {
      return false;
    }

    // 3) Пошук за словом чи фразою
    if (
      lowerCaseSearchPhrase &&
      !(
        task.subject.toLowerCase().includes(lowerCaseSearchPhrase) ||
        (task.additionalInfo &&
          task.additionalInfo.toLowerCase().includes(lowerCaseSearchPhrase))
      )
    ) {
      return false;
    }

    // 4) Пошук за статусом
    if (
      searchData.searchByStatus === "Термін закінчився" &&
      moment(currentDate, "DD.MM.YYYY", true).isBefore(
        moment(task.dateTo, "DD.MM.YYYY", true)
      )
    ) {
      return false;
    }

    if (
      searchData.searchByStatus === "Виконується" &&
      moment(currentDate, "DD.MM.YYYY", true).isAfter(
        moment(task.dateTo, "DD.MM.YYYY", true)
      )
    ) {
      return false;
    }

    return true;
  });

  if (searchData.searchByOtherMembers !== "") {
    filteredTodos = filteredTodos.filter((task) => {
      // 5) Пошук за користувачем
      if (
        searchData.searchByOtherMembers &&
        task.otherMembers &&
        task.otherMembers
          .split(", ")
          .some((member) =>
            searchData.searchByOtherMembers.includes(member.trim())
          )
      ) {
        return true;
      }
      return false;
    });
  }

  return filteredTodos.length > 0 ? filteredTodos : [];
};

module.exports = searchTodos;
