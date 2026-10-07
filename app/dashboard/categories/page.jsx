"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Flex,
  Modal,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CategoryForm from "@/components/dashboard/categorie/CategoryForm"; // Sesuaikan path

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // State untuk Modal dan Form
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null); // null = Create, object = Edit

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);
  77;

  const fetchCategories = async (query = "", page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/categories?q=${query}&page=${page}&limit=${limit}&isDashboard=true`,
      );
      const result = await response.json();
      setCategories(result.data);
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
      fetchCategories(searchText, 1, tableParams.pagination.pageSize);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  const handleTableChange = (pagination) => {
    fetchCategories(searchText, pagination.current, pagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Kategori dihapus.");
        fetchCategories(
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

  // Fungsi Pembuka Modal
  const openCreateModal = () => {
    setSelectedData(null); // Set null agar form bertindak sebagai Create
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setSelectedData(record); // Suntikkan data baris tabel agar form bertindak sebagai Edit
    setIsModalOpen(true);
  };

  // Fungsi Penutup Modal (saat sukses)
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    // Refresh tabel agar data baru langsung muncul
    fetchCategories(
      searchText,
      tableParams.pagination.current,
      tableParams.pagination.pageSize,
    );
  };

  const columns = [
    {
      title: "No",
      width: 70,
      render: (_, __, i) =>
        (tableParams.pagination.current - 1) * tableParams.pagination.pageSize +
        i +
        1,
    },
    { title: "Nama Kategori", dataIndex: "name", key: "name" },
    {
      title: "Status",
      dataIndex: "published",
      render: (pub) => (
        <Tag color={pub ? "green" : "volcano"}>
          {pub ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {/* Ubah Link menjadi pemanggil fungsi openEditModal */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Hapus
            </Button>
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
          onClick={openCreateModal}
        >
          Tambah Kategori
        </Button>
        <Input
          placeholder="Cari kategori..."
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
        dataSource={categories}
        loading={loading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        bordered
      />

      {isMounted && (
        <Modal
          title={selectedData ? "Edit Kategori" : "Tambah Kategori"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnHidden // Wajib ada agar form keriset ulang setiap dibuka
        >
          <CategoryForm
            initialData={selectedData}
            onSuccess={handleModalSuccess}
          />
        </Modal>
      )}
    </div>
  );
}
