import Joi from "joi";

export const userValidation = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "nama kategori tidak boleh kosong.",
      "any.required": "nama kategori wajib diisi.",
    }),

    username: Joi.string().alphanum().min(3).required().messages({
      "string.empty": "Username tidak boleh kosong",
      "string.min": "Username minimal 3 karakter",
      "string.alphanum":
        "Username hanya boleh menggunakan huruf dan angka tanpa spasi",
      "any.required": "Username wajib diisi",
    }),

    email: Joi.string().email().required().messages({
      "string.empty": "Email tidak boleh kosong",
      "string.email": "Format email tidak valid",
    }),
    password: isUpdate
      ? Joi.string().min(6).allow(null, "").messages({
          "string.min": "Password minimal 6 karakter",
        })
      : Joi.string().min(6).required().messages({
          "string.empty": "Password wajib diisi",
          "string.min": "Password minimal 6 karakter",
        }),
    roleId: Joi.number().required().messages({
      "number.base": "Role wajib dipilih",
    }),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
