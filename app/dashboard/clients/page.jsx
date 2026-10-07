"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import FormModal from "@/components/dashboard/client/FormModal"; // Sesuaikan path import dengan lokasi FormModal Anda

const ClientsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Jika ingin membuat halaman Vendors, cukup ganti URL ini menjadi "/api/vendors"
      const response = await fetch("/api/clients");
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

  // Fungsi untuk membuka modal tambah data baru
  const handleAdd = () => {
    setSelectedData(null); // Kosongkan initialData
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal edit data
  const handleEdit = (record) => {
    setSelectedData(record); // Isi initialData dengan data baris yang diklik
    setIsModalOpen(true);
  };

  // Fungsi untuk menghapus data
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Data berhasil dihapus");
        fetchData(); // Refresh tabel setelah dihapus
      } else {
        const result = await response.json();
        message.error(result.error || "Gagal menghapus data");
      }
    } catch (error) {
      message.error("Terjadi kesalahan jaringan");
    }
  };

  // Definisi kolom tabel Ant Design
  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Kontak",
      dataIndex: "contact",
      key: "contact",
    },
    {
      title: "Alamat",
      dataIndex: "address",
      key: "address",
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
      title="Manajemen Clients"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah Client
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id" // Sangat penting agar Ant Design tidak error key
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Memanggil komponen Modal yang sudah kita buat sebelumnya */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedData}
        refreshData={fetchData}
        endpoint="/api/clients" // Ganti menjadi "/api/vendors" untuk halaman Vendors
        title="Client" // Ganti menjadi "Vendor" untuk halaman Vendors
      />
    </Card>
  );
};

export default ClientsPage;
