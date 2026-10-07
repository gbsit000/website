import Joi from "joi";

export const aboutValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "title kategori tidak boleh kosong.",
      "any.required": "title kategori wajib diisi.",
    }),
    description: Joi.string().required().messages({
      "string.empty": "description kategori tidak boleh kosong.",
      "any.required": "description kategori wajib diisi.",
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
    address: Joi.string().required().messages({
      "string.empty": "Alamat tidak boleh kosong",
      "any.required": "Alamat wajib diisi",
    }),
    published: Joi.boolean().default(false),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
