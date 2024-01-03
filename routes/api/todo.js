const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/todoController");

const {
  validateBody,
  isValidId,
  authorize,
  authenticateRefresh,
} = require("../../middlewares");
const { schemas } = require("../../models/todo");
const router = express.Router();

// create Todo
router.post(
  "/create",
  authorize,
  validateBody(schemas.addTodoSchema),
  ctrlWrapper(ctrl.createTodo)
);

// edit Todo
router.post(
  "/edit",
  authorize,
  validateBody(schemas.editTodoSchema),
  ctrlWrapper(ctrl.editTodo)
);

// get Week Todo
router.post("/todosWeek", authorize, ctrlWrapper(ctrl.getTodosWeek));

// get Search Todo
router.post(
  "/search",
  authorize,
  validateBody(schemas.searchTodosSchema),
  ctrlWrapper(ctrl.getTodosSearch)
);

//synchronize
router.post("/synchronize", authorize, ctrlWrapper(ctrl.synchronizeTodo));

module.exports = router;
