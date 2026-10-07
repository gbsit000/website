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
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import FormModal from "@/components/dashboard/abouts/FormModal";

const { Paragraph } = Typography;

const AboutsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/abouts");
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
      const response = await fetch(`/api/abouts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Data berhasil dihapus");
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
      title: "Judul",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text) => <span className="font-semibold">{text || "-"}</span>,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (text) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: false, tooltip: text }}
          className="mb-0"
        >
          {text || "-"}
        </Paragraph>
      ),
    },
    {
      title: "Status",
      dataIndex: "published",
      key: "published",
      width: "15%",
      render: (published) => (
        <Tag color={published ? "green" : "default"}>
          {published ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: "20%",
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
            title="Hapus Data"
            description="Apakah Anda yakin ingin menghapus data ini?"
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
      title="Manajemen Profil (About)"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah Data
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

export default AboutsPage;
