"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Switch,
  Button,
  Upload,
  Space,
  message,
  Modal,
  Select,
  Flex,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import RichTextEditor from "@/components/editor/RichTextEditor";
const { TextArea } = Input;

const EditProductForm = ({ initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [select, setSelect] = useState({ brands: [], categories: [] }); // Set default object
  const [loading, setLoading] = useState(false);

  // --- FUNGSI FETCH DATA BRAND & KATEGORI ---
  const getAllBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (!response.ok) throw new Error("Gagal mengambil data brand");
      const { data } = await response.json();
      return data;
    } catch (error) {
      message.error("Gagal mengambil data brand");
      return [];
    }
  };

  const getAllCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const { data } = await response.json();
      return data;
    } catch (error) {
      message.error(error);
      return [];
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
    // Jalankan fetch data dropdown
    getAllData().then((data) => {
      setSelect(data);
    });

    // Set gambar awal dari initialValues
    if (initialValues && initialValues.images) {
      const initialFileList = initialValues.images.map((image) => ({
        id: image.id,
        name: initialValues.name,
        status: "done",
        url: image.name,
      }));
      setFileList(initialFileList);
    }
  }, [initialValues]);

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("tag", values.tag || "");
    formData.append("description", values.description || "");
    formData.append("published", values.published ? "true" : "false");
    formData.append("metaDescription", values.metaDescription || "");
    formData.append("metaKeywords", values.metaKeywords || "");

    // Pastikan menangkap nilai dari Select dan memasukkannya ke FormData
    formData.append("categorieId", values.categorieId || "");
    formData.append("brandId", values.brandId || "");

    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("newImages", file.originFileObj);
      } else if (file.url) {
        const fileName = file.url.split("/").pop();
        formData.append("keptImages", fileName);
      }
    });

    try {
      const response = await fetch(`/api/products/${initialValues.id}`, {
        method: "PUT",
        body: formData, // Jangan set header Content-Type secara manual, biarkan browser mengaturnya untuk FormData
      });
      if (response.ok) {
        message.success("Produk berhasil diperbarui!");
      } else {
        message.error(response.error || "Gagal memperbarui produk.");
      }
    } catch (error) {
      message.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (editor) => {
    form.setFieldsValue({ description: editor });
  };

  const onRemove = async (file) => {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        title: "Konfirmasi Hapus Gambar",
        content:
          "Apakah Anda yakin ingin menghapus gambar ini secara permanen?",
        okText: "Ya, Hapus",
        okType: "danger",
        cancelText: "Batal",
        centered: true,
        onOk: async () => {
          try {
            if (file.url) {
              const res = await fetch(`/api/images/${file.id}`, {
                method: "DELETE",
              });
              if (!res.ok) throw new Error("Gagal menghapus gambar");
              message.success("Gambar berhasil dihapus!");
            }
            resolve(true);
          } catch (error) {
            message.error(error.message);
            reject(false);
          }
        },
        onCancel: () => reject(false),
      });
    });
  };
  console.log(fileList);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues} // Nilai default akan mengisi Select otomatis berdasarkan brandId & categorieId
      onFinish={onFinish}
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
        rules={[{ required: true, message: "Nama produk wajib diisi" }]}
      >
        <Input placeholder="Masukkan nama produk" />
      </Form.Item>

      <Form.Item name="tag" label="Tag Produk">
        <Input placeholder="Contoh: Elekronik, Diskon, Sepatu" />
      </Form.Item>

      {/* --- FLEX LAYOUT PERSIS SEPERTI CREATE PRODUCT --- */}
      <Flex gap={12} vertical>
        <Flex gap={8}>
          <Form.Item name="categorieId" label="Kategori" style={{ flex: 1 }}>
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

          <Form.Item name="brandId" label="Brand" style={{ flex: 1 }}>
            <Select
              showSearch={{
                filterOption: (input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              placeholder="Pilih Brand"
              options={select.brands?.map((brand) => ({
                label: brand.name,
                value: brand.id,
              }))}
            />
          </Form.Item>
        </Flex>
      </Flex>

      <Form.Item name="description" label="Deskripsi Produk">
        {/* <Markdown handleEditorChange={handleEditorChange} name="description" /> */}
        <RichTextEditor
          onChange={handleEditorChange}
          placeholder="Tulis isi artikel di sini..."
          minHeight="400px"
        />
      </Form.Item>

      <Form.Item
        name="published"
        label="Status Publish"
        valuePropName="checked"
      >
        <Switch checkedChildren="Published" unCheckedChildren="Draft" />
      </Form.Item>

      <Form.Item name="images" label="Gambar Produk" valuePropName="images">
        <Upload
          listType="picture-card"
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList }) => setFileList(fileList)}
          onRemove={onRemove}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item name="metaDescription" label="Meta Description (SEO)">
        <TextArea
          rows={2}
          placeholder="Deskripsi ringkas untuk mesin pencari (Google)"
        />
      </Form.Item>

      <Form.Item name="metaKeywords" label="Meta Keywords (SEO)">
        <Input placeholder="Pisahkan kata kunci dengan koma (misal: sepatu, murah, lari)" />
      </Form.Item>

      <Form.Item label={null}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Simpan Perubahan
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EditProductForm;
