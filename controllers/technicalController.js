const { User } = require("../models/user");

// get technical data
const getTechnicalData = async (req, res, next) => {
  try {
    const users = await User.find({}, { email: 1, _id: 0 });
    const emailArray = users.map((user) => user.email);
    const options = [
      { value: "Урочиста дата", label: "Урочиста дата" },
      { value: "Автомобіль", label: "Автомобіль" },
      { value: "Сім'я", label: "Сім'я" },
      { value: "Дім", label: "Дім" },
      { value: "Робота", label: "Робота" },
      { value: "Подорожі", label: "Подорожі" },
      { value: "Фінанси", label: "Фінанси" },
      { value: "Родичі та друзі", label: "Родичі та друзі" },
      { value: "Інше", label: "Інше" },
    ];

    res.status(200).json({ listEmail: emailArray, optionMenu: options });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTechnicalData,
};
