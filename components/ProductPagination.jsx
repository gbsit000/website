"use client";

import { Pagination } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ProductPagination({ total, page, limit }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper untuk membuat URL string
  const createPageUrl = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    params.set("limit", limit.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (newPage, newPageSize) => {
    router.push(createPageUrl(newPage));
  };

  // Custom render agar Ant Design menghasilkan tag <a href="..."> asli untuk SEO
  const itemRender = (current, type, originalElement) => {
    if (type === "page") {
      return <Link href={createPageUrl(current)}>{current}</Link>;
    }
    if (type === "prev") {
      return <Link href={createPageUrl(Math.max(1, page - 1))}>Previous</Link>;
    }
    if (type === "next") {
      return <Link href={createPageUrl(page + 1)}>Next</Link>;
    }
    return originalElement;
  };

  return (
    <Pagination
      current={page}
      pageSize={limit}
      total={total}
      onChange={handlePageChange}
      itemRender={itemRender} // <-- PENTING UNTUK SEO
      showSizeChanger={false}
      style={{ marginTop: "20px" }}
      align="center"
    />
  );
}
