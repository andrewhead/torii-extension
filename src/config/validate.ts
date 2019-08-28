import Joi from "@hapi/joi";
import { OutputTypes } from "santoku-store";

/**
 * Only validates types and ranges of properties; does not attempt to run any of the callback
 * functions. You will need to do runtime validation of callbacks.
 */
export function validate(config: any) {
  const outputGeneratorSchema = Joi.object().keys({
    id: Joi.string().required(),
    command: Joi.string().required(),
    type: Joi.string()
      .required()
      .only(...OutputTypes),
    when: Joi.func()
      .arity(1)
      .optional(),
    path: Joi.alternatives(Joi.func(), Joi.array().items(Joi.string())).optional(),
    environment: Joi.object().pattern(/.*/, Joi.string()),
    timeout: Joi.number()
      .strict()
      .integer()
      .positive()
  });
  const schema = Joi.object().keys({
    outputGenerators: Joi.array()
      .items(outputGeneratorSchema)
      .required()
  });
  const { error } = schema.validate(config);
  return {
    valid: error === null,
    error
  };
}
