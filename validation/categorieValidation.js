import Joi from "joi";

const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

export const categorieValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Nama kategori tidak boleh kosong.",
      "any.required": "Nama kategori wajib diisi.",
    }),

    image: Joi.object({
      name: Joi.string().required(),
      size: Joi.number()
        .max(2 * 1024 * 1024)
        .messages({
          "number.max": "Ukuran gambar tidak boleh lebih dari 2MB.",
        }),
      type: Joi.string()
        .valid(...ALLOWED_IMAGE_FORMATS)
        .required()
        .messages({
          "any.only":
            "Format gambar ditolak! Hanya diperbolehkan format JPG, PNG, atau WEBP.",
          "any.required": "Tipe file tidak terdeteksi.",
        }),
    })
      .required()
      .messages({
        "any.required": "Gambar kategori wajib diunggah.",
      }),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
