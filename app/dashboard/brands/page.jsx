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
import BrandForm from "@/components/dashboard/brand/BrandForm";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchBrands = async (query = "", page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/brands?q=${query}&page=${page}&limit=${limit}`,
      );
      const result = await response.json();
      setBrands(result.data);
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
      fetchBrands(searchText, 1, tableParams.pagination.pageSize);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);

  const handleTableChange = (pagination) => {
    fetchBrands(searchText, pagination.current, pagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Brand dihapus.");
        fetchBrands(
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

  const openCreateModal = () => {
    setSelectedData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setSelectedData(record);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchBrands(
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
    { title: "Nama Brand", dataIndex: "name", key: "name" },
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
          onClick={openCreateModal}
        >
          Tambah Brand
        </Button>
        <Input
          placeholder="Cari brand..."
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
        dataSource={brands}
        loading={loading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        bordered
      />

      {isMounted && (
        <Modal
          title={selectedData ? "Edit Brand" : "Tambah Brand"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnHidden
        >
          <BrandForm
            initialData={selectedData}
            onSuccess={handleModalSuccess}
          />
        </Modal>
      )}
    </div>
  );
}
