const Joi = require("@hapi/joi");

queryValidationSchema = Joi.object().keys({
  draw: Joi.number().required(),
  order: Joi.array().items(
    Joi.object({
      column: Joi.number().required(),
      dir: Joi.string().required().lowercase().trim(),
    })
  ),
  start: Joi.number().required(),
  length: Joi.number().required(),
  search: Joi.object({
    value: Joi.string().required().allow(""),
    regex: Joi.boolean().required(),
  }),
  columns: Joi.array().items(
    Joi.object({
      data: Joi.string().required().allow(""),
      name: Joi.string().required().allow(""),
      searchable: Joi.boolean().required(),
      orderable: Joi.boolean().required(),
      search: Joi.object({
        value: Joi.string().required().allow(""),
        regex: Joi.boolean().required(),
      }),
    })
  ),
  _: Joi.string(),
});

module.exports = queryValidationSchema;
