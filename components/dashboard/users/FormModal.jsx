"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";

const FormModal = ({ isOpen, onClose, initialData, refreshData, roles }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        form.setFieldsValue({
          name: initialData.name,
          email: initialData.email,
          roleId: initialData.roleId,
          password: "", // Password sengaja dikosongkan saat edit
        });
      } else {
        form.resetFields();
      }
      setValidationErrors({});
    }
  }, [isOpen, initialData, form, isEditMode]);

  const onFinish = async (values) => {
    setLoading(true);
    setValidationErrors({});

    const apiUrl = isEditMode ? `/api/users/${initialData.id}` : "/api/users";
    const apiMethod = isEditMode ? "PUT" : "POST";

    // Hapus properti password dari payload jika di mode edit dan inputnya kosong
    const payload = { ...values };
    if (isEditMode && !payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(
          `Pengguna berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
        );
        form.resetFields();
        onClose();
        refreshData();
      } else if (response.status === 422) {
        setValidationErrors(result.error);
      } else if (response.status === 409) {
        // Tangkap error email bentrok
        setValidationErrors({ email: result.error.email });
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
      title={isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Nama Lengkap"
          validateStatus={validationErrors.name ? "error" : ""}
          help={validationErrors.name}
        >
          <Input placeholder="Masukkan nama lengkap" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username wajib diisi" }]}
          validateStatus={validationErrors.username ? "error" : ""}
          help={validationErrors.username}
        >
          <Input placeholder="Masukkan username (tanpa spasi)" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Alamat Email"
          rules={[{ required: true, message: "Email wajib diisi" }]}
          validateStatus={validationErrors.email ? "error" : ""}
          help={validationErrors.email}
        >
          <Input type="email" placeholder="contoh@email.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: !isEditMode, message: "Password wajib diisi" }]}
          validateStatus={validationErrors.password ? "error" : ""}
          help={
            validationErrors.password ||
            (isEditMode ? "Kosongkan jika tidak ingin mengubah password" : "")
          }
        >
          <Input.Password
            placeholder={
              isEditMode ? "Masukkan password baru" : "Masukkan password"
            }
          />
        </Form.Item>

        <Form.Item
          name="roleId"
          label="Peran (Role)"
          rules={[{ required: true, message: "Role wajib dipilih" }]}
          validateStatus={validationErrors.roleId ? "error" : ""}
          help={validationErrors.roleId}
        >
          <Select
            placeholder="Pilih peran pengguna"
            options={roles.map((role) => ({
              value: role.id,
              label: role.role.charAt(0).toUpperCase() + role.role.slice(1),
            }))}
          />
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
