"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Card, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import FormModal from "@/components/dashboard/users/FormModal";

const UsersPage = () => {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const resUsers = await fetch("/api/users");
      const resultUsers = await resUsers.json();
      if (resUsers.ok) setData(resultUsers.data);

      // Fetch roles (Pastikan Anda memiliki API untuk GET /api/roles)
      // Jika belum ada API roles, Anda bisa membuat array sementara di sini
      const resRoles = await fetch("/api/roles");
      const resultRoles = await resRoles.json();
      if (resRoles.ok) setRoles(resultRoles.data);
    } catch (error) {
      message.error("Gagal memuat data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Pengguna berhasil dihapus");
        fetchData();
      } else {
        const result = await response.json();
        message.error(result.error || "Gagal menghapus data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    }
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      render: (text) => text || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Peran (Role)",
      key: "role",
      render: (_, record) => {
        // Asumsi API Anda melakukan 'include: { role: true }'
        const roleName = record.role.role || "Unknown";

        let color = "default";
        if (roleName.toLowerCase() === "admin") color = "red";
        if (roleName.toLowerCase() === "marketing") color = "blue";
        if (roleName.toLowerCase() === "purchasing") color = "green";
        if (roleName.toLowerCase() === "supir") color = "orange";

        return <Tag color={color}>{roleName.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Pengguna"
            description="Apakah Anda yakin ingin menghapus akun ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Manajemen Pengguna"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah Pengguna
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedData}
        refreshData={fetchData}
        roles={roles}
      />
    </Card>
  );
};

export default UsersPage;
