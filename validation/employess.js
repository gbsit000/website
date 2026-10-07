import Joi from "joi";
export function employessVAlidation(data) {
  const schema = Joi.object().keys({
    name: Joi.string().required().messages({
      "string.empty": "Nama tidak boleh kosong",
      "any.required": "Nama wajib diisi",
    }),
    role_id: Joi.number().required().messages({
      "string.empty": "Role tidak boleh kosong",
      "any.required": "Role wajib diisi",
    }),
    phone: Joi.string()
      .pattern(new RegExp(/^(\+62|0)[0-9]{9,14}$/))
      .required()
      .messages({
        "string.empty": "Nomer telepon tidak boleh kosong",
        "any.required": "Nomer telepon wajib diisi",
      }),
    email: Joi.string().required().messages({
      "string.empty": "Email tidak boleh kosong",
      "any.required": "Email wajib diisi",
    }),
    published: Joi.boolean().optional(),
  });
  return schema.validate(data, { abortEarly: false });
}
