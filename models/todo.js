const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const todoSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    part: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    dateFrom: {
      type: String,
      required: true,
    },
    dateTo: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
      required: false,
    },
    otherMembers: {
      type: String,
      required: false,
    },
    saveAfterDeadline: {
      type: Boolean,
      required: true,
    },
  },
  { minimize: false, versionKey: false }
);

todoSchema.post("save", handleSaveErrors);

const Todo = model("todo", todoSchema);

const addTodoSchema = Joi.object({
  part: Joi.string().required(),
  subject: Joi.string().required(),
  dateFrom: Joi.string().required(),
  dateTo: Joi.string().required(),
  additionalInfo: Joi.string().required(),
  otherMembers: Joi.string().allow(null, ""),
  saveAfterDeadline: Joi.boolean(),
});

const editTodoSchema = Joi.object({
  _id: Joi.string().required(),
  part: Joi.string().required(),
  subject: Joi.string().required(),
  dateFrom: Joi.string().required(),
  dateTo: Joi.string().required(),
  additionalInfo: Joi.string().required(),
  otherMembers: Joi.string().allow(null, ""),
  saveAfterDeadline: Joi.boolean(),
});

const searchTodosSchema = Joi.object({
  searchByPart: Joi.string().allow(null, ""),
  searchByPhrase: Joi.string().allow(null, ""),
  searchByDate: Joi.string().allow(null, ""),
  searchByStatus: Joi.string().allow(null, ""),
  searchByOtherMembers: Joi.string().allow(null, ""),
});

const schemas = {
  addTodoSchema,
  editTodoSchema,
  searchTodosSchema,
};

module.exports = {
  Todo,
  schemas,
};
