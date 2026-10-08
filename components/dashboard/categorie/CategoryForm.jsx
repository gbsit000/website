"use client";

import { useEffect, useState } from "react";
import { Form, Input, Switch, Button, Upload, message, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

export default function CategoryForm({ initialData, onSuccess }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState([]);
  const isEditMode = !!initialData?.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          published: initialData.published,
        });
        console.log(initialData.image);

        if (initialData.image) {
          setFileList([
            {
              uid: "-1",
              name: initialData.image,
              status: "done",
              url: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/categorie/${initialData.id}/${initialData.image}`,
            },
          ]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [initialData, form]);

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("name", values.name || "");
    formData.append("published", values.published ? "true" : "false");

    const currentFile = fileList[0];
    if (currentFile && currentFile.originFileObj) {
      formData.append("image", currentFile.originFileObj);
    } else if (fileList.length === 0 && isEditMode) {
      formData.append("deleteImage", "true");
    }

    const apiUrl = isEditMode
      ? `/api/categories/${initialData.id}`
      : "/api/categories";
    const apiMethod = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        message.success(
          `Kategori berhasil ${isEditMode ? "diperbarui" : "dibuat"}!`,
        );
      } else {
        setValidation(result.error);

        // message.error(result.error || "Gagal menyimpan data.");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // KUSTOMISASI ITEM RENDER: Agar kotak upload dan preview gambar bisa berdampingan & ada Popconfirm
  const customItemRender = (originNode, file, fileList, actions) => {
    const imgSrc =
      file.url ||
      (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "");

    return (
      <div
        style={{
          position: "relative",
          width: "104px",
          height: "104px",
          margin: "0 8px 8px 0",
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
          padding: "4px",
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fafafa",
        }}
      >
        <img
          src={imgSrc}
          alt="preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "6px",
          }}
        />

        {/* Tombol Aksi (Hapus dengan Popconfirm) di atas gambar */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            gap: "4px",
            background: "rgba(0,0,0,0.2)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {/* Tombol Preview (Opsional) */}
          <a
            href={imgSrc}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff" }}
          >
            <EyeOutlined />
          </a>

          {/* Tombol Delete dengan Popconfirm */}
          <Popconfirm
            title="Hapus Gambar?"
            onConfirm={() => actions.remove()}
            okText="Ya"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <DeleteOutlined
              style={{ color: "#fff", cursor: "pointer", marginLeft: "6px" }}
            />
          </Popconfirm>
        </div>
      </div>
    );
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ published: false }}
    >
      <Form.Item
        name="name"
        label="Nama Kategori"
        validateStatus={validation.name ? "error" : ""}
        help={validation.name}
        hasFeedback
      >
        <Input placeholder="Masukkan nama kategori" />
      </Form.Item>

      <Form.Item
        name="published"
        label="Status Publish"
        valuePropName="checked"
      >
        <Switch checkedChildren="Published" unCheckedChildren="Draft" />
      </Form.Item>

      <Form.Item
        label="Gambar Kategori"
        validateStatus={validation.image ? "error" : ""}
        help={validation.image}
        hasFeedback
      >
        <Upload
          name="image"
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList: newFileList }) =>
            setFileList(newFileList.slice(-1))
          }
          beforeUpload={() => false}
          itemRender={customItemRender}
        >
          {/* Kotak Upload (seperti gambar kedua) akan otomatis muncul jika fileList masih kosong */}
          {fileList.length >= 1 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {isEditMode ? "Simpan Perubahan" : "Buat Kategori"}
        </Button>
      </Form.Item>
    </Form>
  );
}
