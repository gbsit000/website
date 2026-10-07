"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import EditProductForm from "@/components/dashboard/products/EditProductForm";
import { message } from "antd";

export default function Page() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Panggil API Backend
      const response = await fetch(`/api/products/${id}`);
      const { data } = await response.json();
      // Set data produk
      setProduct(data);
    } catch (error) {
      message.error("Gagal fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);
  if (loading) {
    return <div>loading</div>;
  }
  return (
    <div>
      <EditProductForm initialValues={product} />
    </div>
  );
}
