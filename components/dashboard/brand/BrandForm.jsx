"use client";

import { useEffect, useState } from "react";
import { Form, Input, Switch, Button, message } from "antd";

export default function BrandForm({ initialData, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData?.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          published: initialData.published,
        });
      } else {
        form.resetFields();
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [initialData, form]);

  const onFinish = async (values) => {
    setLoading(true);

    const apiUrl = isEditMode ? `/api/brands/${initialData.id}` : "/api/brands";
    const apiMethod = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(
          `Brand berhasil ${isEditMode ? "diperbarui" : "dibuat"}!`,
        );
        if (onSuccess) onSuccess();
      } else {
        message.error(result.error || "Gagal menyimpan data.");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
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
        label="Nama Brand"
        rules={[{ required: true, message: "Nama brand wajib diisi" }]}
      >
        <Input placeholder="Masukkan nama brand" />
      </Form.Item>
      <Form.Item
        name="published"
        label="Status Publish"
        valuePropName="checked"
      >
        <Switch checkedChildren="Published" unCheckedChildren="Draft" />
      </Form.Item>
      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {isEditMode ? "Simpan Perubahan" : "Buat Brand"}
        </Button>
      </Form.Item>
    </Form>
  );
}
