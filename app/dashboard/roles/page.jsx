"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Flex,
  Modal,
  Form,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";

export default function RolePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/roles`);
      const result = await response.json();
      setRoles(result.data);
    } catch (error) {
      message.error("Gagal menarik data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchRoles();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Role dihapus.");
        fetchRoles();
      } else {
        message.error("Gagal menghapus.");
      }
    } catch {
      message.error("Error jaringan.");
    }
  };

  const openModal = (record = null) => {
    setSelectedData(record);
    setIsModalOpen(true); // 1. Perintahkan modal untuk buka terlebih dahulu

    // 2. Beri jeda 10 milidetik agar <Form> masuk ke dalam DOM
    setTimeout(() => {
      if (record) {
        form.setFieldsValue({ role: record.role });
      } else {
        form.resetFields();
      }
    }, 10);
  };

  const onFinish = async (values) => {
    setSubmitLoading(true);
    const isEditMode = !!selectedData;
    const apiUrl = isEditMode ? `/api/roles/${selectedData.id}` : "/api/roles";
    const apiMethod = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          `Role berhasil ${isEditMode ? "diperbarui" : "dibuat"}!`,
        );
        setIsModalOpen(false);
        fetchRoles();
      } else {
        message.error("Gagal menyimpan data.");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    { title: "Nama Role", dataIndex: "role", key: "role" },
    {
      title: "Aksi",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Role?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Flex
        gap="medium"
        justify="space-between"
        align="center"
        style={{ marginBottom: 16 }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Tambah Role
        </Button>
        <Input
          placeholder="Cari role..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 300 }}
        />
      </Flex>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={roles}
        loading={loading}
        bordered
      />

      {isMounted && (
        <Modal
          title={selectedData ? "Edit Role" : "Tambah Role"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="role"
              label="Nama Role"
              rules={[{ required: true, message: "Nama role wajib diisi" }]}
            >
              <Input placeholder="Masukkan nama role (misal: Admin, Staff)" />
            </Form.Item>
            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                block
              >
                {selectedData ? "Simpan Perubahan" : "Buat Role"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}
