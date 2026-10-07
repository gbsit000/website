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
  Card,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Link from "next/link";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  // KOREKSI 1: Ubah urutan parameter menjadi (query, page, limit) agar sesuai dengan cara Anda memanggilnya di bawah
  const fetchProducts = async (query = "", page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/products?q=${query}&page=${page}&limit=${limit}&isDashboard=true`,
      );
      const result = await response.json();
      setProducts(result.products);
      setTableParams({
        pagination: {
          current: page,
          pageSize: limit,
          total: result.totalProduct,
        },
      });
    } catch (error) {
      message.error("Gagal fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Produk berhasil dihapus secara permanen!");
        // KOREKSI 2: Gunakan tableParams.pagination.current dan pertahankan parameter query
        fetchProducts(
          searchText,
          tableParams.pagination.current,
          tableParams.pagination.pageSize,
        );
      } else {
        message.error("Gagal menghapus produk.");
      }
    } catch (error) {
      message.error("Gagal terhubung ke server.");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchText, 1, tableParams.pagination.pageSize);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleTableChange = (pagination) => {
    fetchProducts(searchText, pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "No",
      key: "number",
      width: 70,
      align: "center",
      // KOREKSI 3: Gunakan tableParams.pagination karena 'pagination' tidak ada di scope ini
      render: (_, __, index) =>
        (tableParams.pagination.current - 1) * tableParams.pagination.pageSize +
        index +
        1,
    },
    {
      title: "Nama Produk",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "published",
      key: "published",
      render: (published) => (
        <Tag color={published ? "green" : "volcano"}>
          {published ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/dashboard/products/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Hapus Produk?"
            description="Produk dan semua gambar akan terhapus secara permanen. Yakin?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Manajemen Vendors"
      extra={
        <Flex gap="medium" justify="space-between" align="center">
          <Link href={`/dashboard/products/create`}>
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Tambah Produk
            </Button>
          </Link>
          <Input
            size="large"
            placeholder="Cari nama produk..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
          />
        </Flex>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        bordered
      />
    </Card>
  );
}
