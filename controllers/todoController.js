const { Todo } = require("../models/todo");
const { User } = require("../models/user");
const moment = require("moment-timezone");
const { searchTodos } = require("../helpers/");
const { RequestError, sendTechnicialMail } = require("../helpers/");

//add todo
const createTodo = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const {
      part,
      subject,
      dateFrom,
      dateTo,
      additionalInfo,
      otherMembers,
      saveAfterDeadline,
    } = req.body;

    const newTodo = await Todo.create({
      userId: owner,
      part: part,
      subject: subject,
      dateFrom: dateFrom,
      dateTo: dateTo,
      additionalInfo: additionalInfo,
      otherMembers: otherMembers ? otherMembers : "",
      saveAfterDeadline: saveAfterDeadline,
    });

    await User.findOneAndUpdate(
      { _id: owner },
      { $push: { todos: newTodo._id } }
    );

    res.status(200).json({ message: "Todo added successfully" });
  } catch (error) {
    next(error);
  }
};

//edit todo
const editTodo = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const {
      _id,
      part,
      subject,
      dateFrom,
      dateTo,
      additionalInfo,
      otherMembers,
      saveAfterDeadline,
    } = req.body;

    const existingTodo = await Todo.findOne({ _id, userId: owner });

    if (!existingTodo) {
      return res.status(404).json({ message: "You can't edit this task" });
    }

    existingTodo.part = part;
    existingTodo.subject = subject;
    existingTodo.dateFrom = dateFrom;
    existingTodo.dateTo = dateTo;
    existingTodo.additionalInfo = additionalInfo;
    existingTodo.otherMembers = otherMembers;
    existingTodo.saveAfterDeadline = saveAfterDeadline;

    await existingTodo.save();

    res.status(200).json({ message: "Todo edited successfully" });
  } catch (error) {
    next(error);
  }
};

const getTodosWeek = async (req, res, next) => {
  try {
    const owner = req.user;

    await checkValidTodos(owner._id, next);

    const arrayTodoIds = owner.todos;
    let todos = await Todo.find({ _id: { $in: arrayTodoIds } });

    const todosWithYourEmail = await Todo.find({
      _id: { $nin: arrayTodoIds },
      otherMembers: { $regex: new RegExp(owner.email, "i") },
    });

    todos = [...todos, ...todosWithYourEmail];

    const currentDate = moment();

    const todosThisWeek = todos.filter((todo) => {
      const dueDate = moment(todo.dateTo, "DD.MM.YYYY");
      const daysUntilDue = dueDate.diff(currentDate, "days");
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    res.status(200).json({ arrayTodosWeek: todosThisWeek });
  } catch (error) {
    next(error);
  }
};

const getTodosSearch = async (req, res, next) => {
  try {
    const owner = req.user;
    const searchData = req.body;

    const arrayTodoIds = owner.todos;
    let todos = await Todo.find({ _id: { $in: arrayTodoIds } });

    const todosWithYourEmail = await Todo.find({
      _id: { $nin: arrayTodoIds },
      otherMembers: { $regex: new RegExp(owner.email, "i") },
    });

    todos = [...todos, ...todosWithYourEmail];

    const todosSearch = await searchTodos(searchData, todos);

    console.log("Це результат пошуку", todosSearch);

    res.status(200).json({ arrayTodosSearch: todosSearch });
  } catch (error) {
    next(error);
  }
};

const checkValidTodos = async (userId, next) => {
  try {
    const todos = await Todo.find({ userId });
    const currentDate = moment();

    const invalidTodos = todos.filter((todo) => {
      const dueDate = moment(todo.dateTo, "DD.MM.YYYY");
      const daysUntilDue = dueDate.diff(currentDate, "days");

      return daysUntilDue < 0 && !todo.saveAfterDeadline;
    });

    await Todo.deleteMany({
      _id: { $in: invalidTodos.map((todo) => todo._id) },
    });

    const validTodos = todos.filter((todo) => !invalidTodos.includes(todo));
    await User.findByIdAndUpdate(userId, { $set: { todos: validTodos } });
  } catch (error) {
    next(error);
  }
};

//synchronize todo
const synchronizeTodo = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const todosToSync = req.body;
    const existingTodos = await Todo.find({ userId });

    const todosToSave = todosToSync.filter((todoToSync) => {
      return !existingTodos.some(
        (existingTodo) =>
          existingTodo.part === todoToSync.part &&
          existingTodo.subject === todoToSync.subject &&
          existingTodo.dateFrom === todoToSync.dateFrom &&
          existingTodo.dateTo === todoToSync.dateTo &&
          existingTodo.additionalInfo === todoToSync.additionalInfo &&
          existingTodo.otherMembers === todoToSync.otherMembers
      );
    });

    console.log(todosToSync.length);
    console.log(existingTodos.length);
    console.log(todosToSave.length);

    const promises = todosToSave.map(async (todoToSave) => {
      const newTodo = new Todo({
        userId,
        ...todoToSave,
      });
      await newTodo.save();
    });

    await Promise.all(promises);

    res
      .status(200)
      .json({ message: "Todos are successfully synchronized with the server" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  editTodo,
  getTodosWeek,
  getTodosSearch,
  synchronizeTodo,
};
