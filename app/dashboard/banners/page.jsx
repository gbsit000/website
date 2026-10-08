"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Tag,
  Image,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import FormModal from "@/components/dashboard/banners/formModal";

const BannersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/banners");
      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        message.error(result.error || "Gagal mengambil data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
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
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Banner berhasil dihapus");
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
      title: "Gambar",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Image
          width={100}
          src={image}
          alt="banner"
          style={{ objectFit: "cover", borderRadius: "6px" }}
          fallback="/placeholder-image.png" // Opsional: Tambahkan gambar placeholder jika gagal dimuat
        />
      ),
    },
    {
      title: "Judul",
      dataIndex: "title",
      key: "title",
      render: (text) => text || "-",
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
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
            title="Hapus Banner"
            description="Apakah Anda yakin ingin menghapus banner beserta gambarnya?"
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
      title="Manajemen Banner"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah Banner
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
      />
    </Card>
  );
};

export default BannersPage;
