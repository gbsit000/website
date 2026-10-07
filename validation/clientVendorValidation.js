import Joi from "joi";

export const clientVendorValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Nama tidak boleh kosong",
      "any.required": "Nama wajib diisi",
    }),
    address: Joi.string().required().messages({
      "any.required": "Email wajib diisi",
    }),
    contact: Joi.string().required().messages({
      "any.required": "Email wajib diisi",
    }),
    email: Joi.string().required().email().allow(null, "").messages({
      "string.email": "Format alamat email tidak valid",
      "any.required": "Email wajib diisi",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};
