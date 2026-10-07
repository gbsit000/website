"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, message, Card, Alert } from "antd";

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // 1. PANTAU INPUTAN SECARA REAL-TIME
  const watchUsername = Form.useWatch("usernameOrEmail", form);
  const watchPassword = Form.useWatch("password", form);

  // 2. LOGIKA DISABLE: Tombol mati jika salah satu kosong atau undefined
  const isButtonDisabled = !watchUsername || !watchPassword;

  const onFinish = async (values) => {
    setErrorMessage("");

    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      usernameOrEmail: values.usernameOrEmail,
      password: values.password,
    });

    setLoading(false);

    if (result?.error) {
      setErrorMessage(result.error);
    } else {
      message.success("Login berhasil!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="Login Sistem" className="w-96 shadow-lg">
        {errorMessage && (
          <Alert title={errorMessage} type="error" showIcon className="mb-4" />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="usernameOrEmail" label="Email atau Username">
            <Input placeholder="Masukkan email atau username" size="large" />
          </Form.Item>

          <Form.Item name="password" label="Password">
            <Input.Password placeholder="Masukkan password" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
            disabled={isButtonDisabled} // <--- 3. TERAPKAN DI SINI
          >
            Masuk
          </Button>
        </Form>
      </Card>
    </div>
  );
}
