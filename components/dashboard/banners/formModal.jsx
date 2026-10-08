"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Switch, message, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const FormModal = ({ isOpen, onClose, initialData, refreshData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        form.setFieldsValue({
          title: initialData.title,
          description: initialData.description,
          published: initialData.published,
        });

        // Menampilkan gambar lama jika ada
        if (initialData.image) {
          setFileList([
            {
              uid: "-1",
              name: initialData.image,
              status: "done",
              url: initialData.image,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ published: false });
        setFileList([]);
      }
      setValidationErrors({});
    }
  }, [isOpen, initialData, form]);

  const onFinish = async (values) => {
    // Validasi Frontend: Cegah submit jika fileList kosong saat membuat banner baru

    setLoading(true);
    setValidationErrors([]);

    const formData = new FormData();
    formData.append("title", values.title || "");
    formData.append("description", values.description || "");
    formData.append("published", values.published ? "true" : "false");

    // Sisipkan file gambar atau sinyal hapus
    const currentFile = fileList[0];
    if (currentFile && currentFile.originFileObj) {
      formData.append("image", currentFile.originFileObj);
    } else if (fileList.length === 0 && isEditMode) {
      // Sinyal ke backend bahwa gambar lama sengaja dihapus
      formData.append("deleteImage", "true");
    }

    const apiUrl = isEditMode
      ? `/api/banners/${initialData.id}`
      : "/api/banners";
    const apiMethod = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        body: formData, // Menggunakan FormData, BUKAN JSON.stringify
      });

      const result = await response.json();

      if (response.ok) {
        message.success(
          `Banner berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
        );
        form.resetFields();
        setFileList([]);
        onClose();
        refreshData();
      } else if (response.status === 422) {
        setValidationErrors(result.error);
      } else {
        message.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit Banner" : "Tambah Banner"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Gambar Banner"
          required
          validateStatus={validationErrors.image ? "error" : ""}
          help={validationErrors.image}
        >
          <Upload
            name="image"
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newFileList }) =>
              setFileList(newFileList.slice(-1))
            }
            beforeUpload={() => false} // Mencegah upload otomatis oleh Ant Design
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name="title"
          label="Judul Banner"
          validateStatus={validationErrors.title ? "error" : ""}
          help={validationErrors.title}
        >
          <Input placeholder="Masukkan judul banner (Opsional)" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Deskripsi"
          validateStatus={validationErrors.description ? "error" : ""}
          help={validationErrors.description}
        >
          <Input.TextArea
            rows={3}
            placeholder="Masukkan deskripsi banner (Opsional)"
          />
        </Form.Item>

        <Form.Item
          name="published"
          label="Status Publish"
          valuePropName="checked"
        >
          <Switch checkedChildren="Published" unCheckedChildren="Draft" />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end mt-4">
          <Button onClick={onClose} className="mr-2">
            Batal
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Simpan
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
