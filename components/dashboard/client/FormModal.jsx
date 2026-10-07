"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";

// Komponen ini bisa di-reuse untuk Client maupun Vendor
// Cukup ubah props endpoint, contoh: endpoint="/api/clients" atau "/api/vendors"
const FormModal = ({
  isOpen,
  onClose,
  initialData,
  refreshData,
  endpoint,
  title,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = !!initialData;

  // Isi form secara otomatis jika dalam mode Edit
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
      setValidationErrors({});
    }
  }, [isOpen, initialData, form, isEditMode]);

  const onFinish = async (values) => {
    setLoading(true);
    setValidationErrors({});

    const apiUrl = isEditMode ? `${endpoint}/${initialData.id}` : endpoint;
    const apiMethod = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(
          `Data ${title} berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
        );
        form.resetFields();
        onClose();
        refreshData(); // Panggil fungsi untuk me-refresh tabel di parent component
      } else if (response.status === 422) {
        // Tangkap error dari Joi
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
      title={isEditMode ? `Edit ${title}` : `Tambah ${title}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Nama"
          validateStatus={validationErrors.name ? "error" : ""}
          help={validationErrors.name}
        >
          <Input placeholder="Masukkan nama lengkap" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          validateStatus={validationErrors.email ? "error" : ""}
          help={validationErrors.email}
        >
          <Input placeholder="contoh@email.com" />
        </Form.Item>

        <Form.Item
          name="contact"
          label="Kontak / Telepon"
          validateStatus={validationErrors.contact ? "error" : ""}
          help={validationErrors.contact}
        >
          <Input placeholder="Masukkan nomor telepon" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Alamat"
          validateStatus={validationErrors.address ? "error" : ""}
          help={validationErrors.address}
        >
          <Input.TextArea rows={3} placeholder="Masukkan alamat lengkap" />
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
