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
  Select,
  Switch,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";

export default function EmployePage() {
  const [employes, setEmployes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
  });

  useEffect(() => {
    setIsMounted(true);
    fetchRoles(); // Ambil data role untuk dropdown
  }, []);

  const fetchRoles = async () => {
    try {
      // Ambil seluruh data role tanpa limit untuk opsi select
      const res = await fetch("/api/roles?limit=100");
      const result = await res.json();
      setRoles(result.data || []);
    } catch {
      message.error("Gagal memuat data roles");
    }
  };

  const fetchEmployes = async (query = "", page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/employees?q=${query}&page=${page}&limit=${limit}`,
      );
      const result = await response.json();
      setEmployes(result.data);
      setTableParams({
        pagination: { current: page, pageSize: limit, total: result.total },
      });
    } catch (error) {
      message.error("Gagal menarik data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchEmployes(searchText, 1, tableParams.pagination.pageSize);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  const handleTableChange = (pagination) => {
    fetchEmployes(searchText, pagination.current, pagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Karyawan dihapus.");
        fetchEmployes(
          searchText,
          tableParams.pagination.current,
          tableParams.pagination.pageSize,
        );
      } else {
        message.error("Gagal menghapus.");
      }
    } catch {
      message.error("Error jaringan.");
    }
  };

  const openModal = (record = null) => {
    setSelectedData(record);
    setIsModalOpen(true);

    setTimeout(() => {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          email: record.email,
          phone: record.phone,
          role_id: record.role_id,
        });
      } else {
        form.resetFields();
      }
    }, 10);
  };

  const onFinish = async (values) => {
    setSubmitLoading(true);
    const isEditMode = !!selectedData;
    const apiUrl = isEditMode
      ? `/api/employees/${selectedData.id}`
      : "/api/employees";
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
          `Karyawan berhasil ${isEditMode ? "diperbarui" : "dibuat"}!`,
        );
        setIsModalOpen(false);
        fetchEmployes(
          searchText,
          tableParams.pagination.current,
          tableParams.pagination.pageSize,
        );
      } else {
        setError(result.error);
        message.error("Gagal menyimpan data.");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: "No",
      width: 70,
      align: "center",
      render: (_, __, i) =>
        (tableParams.pagination.current - 1) * tableParams.pagination.pageSize +
        i +
        1,
    },
    { title: "Nama", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Telepon", dataIndex: "phone", key: "phone" },
    {
      title: "Jabatan (Role)",
      key: "role",
      render: (_, record) => record.roleData?.role || "-", // Menampilkan nama role dari relasi
    },
    {
      title: "Status",
      dataIndex: "published",
      key: "published",
      render: (published) => (
        <Tag color={published ? "green" : "default"}>
          {published ? "Published" : "Draft"}
        </Tag>
      ),
    },
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
            title="Hapus Karyawan?"
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
          Tambah Karyawan
        </Button>
        <Input
          placeholder="Cari nama karyawan..."
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
        dataSource={employes}
        loading={loading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        bordered
      />

      {isMounted && (
        <Modal
          title={selectedData ? "Edit Karyawan" : "Tambah Karyawan"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          footer={null}
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Nama Lengkap"
              help={error?.["name"]}
              validateStatus={error?.["name"] && "error"}
              hasFeedback
            >
              <Input placeholder="Masukkan nama lengkap" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Alamat Email"
              help={error?.["email"]}
              validateStatus={error?.["email"] && "error"}
              hasFeedback
            >
              <Input placeholder="Masukkan alamat email" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Nomor Telepon"
              help={error?.["phone"]}
              validateStatus={error?.["phone"] && "error"}
              hasFeedback
            >
              <Input placeholder="Masukkan nomor telepon" />
            </Form.Item>
            <Form.Item
              name="role_id"
              label="Jabatan (Role)"
              help={error?.["role_id"]}
              validateStatus={error?.["role_id"] && "error"}
              hasFeedback
            >
              <Select placeholder="Pilih jabatan" allowClear>
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.role}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="published"
              label="Status Publish"
              valuePropName="checked"
            >
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                block
              >
                {selectedData ? "Simpan Perubahan" : "Simpan Karyawan"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}
