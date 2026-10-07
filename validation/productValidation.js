import Joi from "joi";
const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
export function productValidation(data) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(225).required().messages({
      "string.empty": "Nama tidak boleh kosong",
      "any.required": "Nama wajib diisi",
    }),
    categorieId: Joi.number().integer().required().messages({
      "number.base": "Kategori wajib dipilih", // Ubah pesan ini
      "any.required": "Kategori wajib dipilih",
    }),
    brandId: Joi.number().integer().required().messages({
      "number.base": "Kategori wajib dipilih", // Ubah pesan ini
      "any.required": "Kategori wajib dipilih",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description tidak boleh kosong",
      "any.required": "Description wajib diisi",
    }),
    metaDescription: Joi.string().required().messages({
      "string.empty": "Meta description tidak boleh kosong",
      "any.required": "Meta description wajib diisi",
    }),
    metaKeywords: Joi.string().required().messages({
      "string.empty": "Meta keywords tidak boleh kosong",
      "any.required": "Meta keywords wajib diisi",
    }),
    published: Joi.boolean().optional(),
    tag: Joi.string().required().messages({
      "string.empty": "Tag tidak boleh kosong",
      "any.required": "Tag wajib diisi",
    }),
    images: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          size: Joi.number()
            .max(2 * 1024 * 1024)
            .messages({
              "number.max":
                "Ukuran gambar terlalu besar. Maksimal upload adalah 2MB.",
            }),

          // 2. Terapkan validasi format di sini
          type: Joi.string()
            .valid(...ALLOWED_IMAGE_FORMATS)
            .required()
            .messages({
              "any.only":
                "Format gambar ditolak! Hanya diperbolehkan format JPG, PNG, atau WEBP.",
              "any.required": "Tipe file tidak terdeteksi.",
            }),
        }),
      )
      .min(1)
      .messages({
        "array.min": "Image Wajib diisi",
      }),
  });
  return schema.validate(data, { abortEarly: false });
}
