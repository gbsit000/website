import Joi from "joi";

export const loginValidation = (data) => {
  const schema = Joi.object({
    usernameOrEmail: Joi.string().required().messages({
      "string.empty": "Email atau Username tidak boleh kosong",
      "any.required": "Email atau Username wajib diisi",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password tidak boleh kosong",
      "any.required": "Password wajib diisi",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};
