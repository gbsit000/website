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
      const response = await fetch(`/api/products/${id}`);
      const result = await response.json();

      if (!response.ok) {
        // tangkap error dari API (400, 404, 500)
        message.error(result.error);
      }
      setProduct(result.data);
    } catch (error) {
      setProduct(null);
      message.error(error.message || "Gagal fetch data");
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
