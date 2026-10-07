import Joi from "joi";

const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

export const bannerValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().allow(null, "").messages({
      "string.base": "Judul harus berupa teks",
      "string.empty": "Title kategori tidak boleh kosong.",
      "any.required": "Title kategori wajib diisi.",
    }),
    description: Joi.string().allow(null, "").messages({
      "string.base": "Deskripsi harus berupa teks",
      "string.empty": "Deskripsi kategori tidak boleh kosong.",
      "any.required": "Deskripsi kategori wajib diisi.",
    }),
    published: Joi.boolean().default(false),

    // Validasi khusus file gambar (Single Upload)
    image: Joi.object({
      name: Joi.string().required(),
      size: Joi.number()
        .max(2 * 1024 * 1024)
        .messages({
          "number.max": "Ukuran gambar banner tidak boleh lebih dari 2MB.",
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
        "any.required": "Gambar banner wajib diunggah.",
        "object.base": "Gambar banner wajib diunggah.", // Menangkap nilai null/undefined
      }),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
