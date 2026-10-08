"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Switch,
  Button,
  Upload,
  Flex,
  message,
  Space,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons"; // Sesuaikan path ini dengan struktur folder Anda
import RichTextEditor from "@/components/editor/RichTextEditor";
const { TextArea } = Input;

const CreateProductForm = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [select, setSelect] = useState([]);
  const [validate, setValidate] = useState([]);

  const getAllBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (!response.ok) {
        throw new Error("Gagal mengambil data brand");
      }
      const { data } = await response.json();
      return data; // Mengembalikan data brand
    } catch (error) {
      message.error("Error fetching brands");
      return []; // Mengembalikan array kosong jika terjadi error
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Gagal mengambil data kategori");
      }
      const { data } = await response.json();
      return data; // Mengembalikan data kategori
    } catch (error) {
      message.error("Error fetching categories");
      return []; // Mengembalikan array kosong jika terjadi error
    }
  };
  const getAllData = async () => {
    const [brands, categories] = await Promise.all([
      getAllBrands(),
      getAllCategories(),
    ]);
    return { brands, categories };
  };

  useEffect(() => {
    getAllData()
      .then((data) => {
        setSelect(data); // Menyimpan data brand dan kategori ke state select
      })
      .catch((error) => {
        message.error("Error fetching brands:");
      });
  }, []);

  // Sinkronisasi data dari komponen Markdown ke Form Ant Design
  const handleEditorChange = (editor) => {
    form.setFieldsValue({ description: editor });
  };

  // Fungsi saat form disubmit
  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();

    // 1. Masukkan data teks ke FormData
    formData.append("name", values.name || "");
    formData.append("tag", values.tag || "");
    formData.append("description", values.description || "");
    // Konversi nilai boolean menjadi string untuk dikirim via FormData
    formData.append("published", values.published ? "true" : "false");
    formData.append("metaDescription", values.metaDescription || "");
    formData.append("metaKeywords", values.metaKeywords || "");

    // Tambahan jika Anda menggunakan input untuk relasi kategori/brand
    formData.append("categorieId", values.categorieId || "");
    formData.append("brandId", values.brandId || "");

    // 2. Masukkan file gambar fisik ke FormData
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });

    try {
      // const response = await createProducts(formData);
      const resutlt = await fetch("/api/products", {
        method: "POST",
        body: formData, // Tanpa header Content-Type, browser yang akan mengaturnya
      });
      const response = await resutlt.json();
      if (resutlt.ok) {
        message.success("Produk berhasil ditambahkan!");
        form.resetFields(); // Kosongkan form setelah sukses
        setFileList([]); // Kosongkan daftar gambar
      } else {
        setValidate(response.error);
      }
    } catch (error) {
      message.error("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        published: false, // Default value untuk switch
      }}
      style={{
        maxWidth: 800,
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "8px",
      }}
    >
      <Form.Item
        name="name"
        label="Nama Produk"
        help={validate?.["name"]}
        validateStatus={validate?.["name"] && "error"}
        hasFeedback
      >
        <Input placeholder="Masukkan nama produk" />
      </Form.Item>

      <Form.Item
        name="tag"
        label="Tag Produk"
        help={validate?.["tag"]}
        validateStatus={validate?.["tag"] && "error"}
        hasFeedback
      >
        <Input placeholder="Contoh: Elektronik, Diskon, Sepatu" />
      </Form.Item>

      {/* --- BAGIAN SELECT KATEGORI DAN BRAND --- */}
      <Flex gap={12} vertical>
        <Flex gap={8}>
          <Form.Item
            name="categorieId"
            label="Kategori"
            style={{ flex: 1 }}
            help={validate?.["categorieId"]}
            validateStatus={validate?.["categorieId"] && "error"}
            hasFeedback
          >
            <Select
              showSearch={{
                filterOption: (input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              placeholder="Pilih Kategori"
              options={select.categories?.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="brandId"
            label="Brand"
            style={{ flex: 1 }}
            help={validate?.["brandId"]}
            validateStatus={validate?.["brandId"] && "error"}
            hasFeedback
          >
            <Select
              showSearch // Mengaktifkan fitur ketik untuk mencari
              placeholder="Pilih Brand"
              options={select.brands?.map((brand) => ({
                label: brand.name,
                value: brand.id,
              }))}
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Form.Item
        name="description"
        label="Deskripsi Produk"
        help={validate?.["description"]}
        validateStatus={validate?.["description"] && "error"}
        hasFeedback
      >
        <RichTextEditor onChange={handleEditorChange} name="description" />
      </Form.Item>

      <Form.Item
        name="published"
        label="Status Publish"
        valuePropName="checked"
      >
        <Switch checkedChildren="Published" unCheckedChildren="Draft" />
      </Form.Item>

      <Form.Item
        label="Gambar Produk"
        help={validate?.["images"]}
        validateStatus={validate?.["images"] && "error"}
        hasFeedback
      >
        <Upload
          name="images"
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          beforeUpload={() => false} // Mencegah upload otomatis, agar kita yang handle via fetch
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item
        name="metaDescription"
        label="Meta Description (SEO)"
        help={validate?.["metaDescription"]}
        validateStatus={validate?.["metaDescription"] && "error"}
        hasFeedback
      >
        <TextArea
          rows={2}
          placeholder="Deskripsi ringkas untuk mesin pencari (Google)"
        />
      </Form.Item>

      <Form.Item
        name="metaKeywords"
        label="Meta Keywords (SEO)"
        help={validate?.["metaKeywords"]}
        validateStatus={validate?.["metaKeywords"] && "error"}
        hasFeedback
      >
        <Input placeholder="Pisahkan kata kunci dengan koma (misal: sepatu, murah, lari)" />
      </Form.Item>

      <Form.Item label={null}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Buat Produk
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CreateProductForm;
