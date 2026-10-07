"use client";

import { signOut } from "next-auth/react";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

export default function LogoutButton() {
  const handleLogout = () => {
    // signOut akan menghapus token/session dan mengarahkan user
    // callbackUrl digunakan untuk menentukan halaman tujuan setelah berhasil logout
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Button
      type="primary"
      danger
      icon={<LogoutOutlined />}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
