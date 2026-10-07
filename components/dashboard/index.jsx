"use client";
import { useState } from "react";
import { Layout, Menu } from "antd";
const { Header, Content, Footer, Sider } = Layout;
import items from "./items";
import LogoutButton from "../LogoutButton";
export default function Dashboard({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [key, setKey] = useState(["1"]);

  return (
    <Layout style={{ minHeight: "100vh" }} theme="light">
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="logo text-center text-gray-800 text-lg font-bold py-4">
          {collapsed ? "O" : "Dashboard"}
        </div>
        <Menu
          selectedKeys={key}
          // openKeys={["1"]}
          mode="inline"
          items={items}
          onSelect={({ key, keyPath, selectedKeys, domEvent }) =>
            setKey(selectedKeys)
          }
        />
      </Sider>
      <Layout style={{ background: "#f4f6f9" }}>
        <Header
          className="flex items-center justify-end"
          style={{ padding: 0, backgroundColor: "#ffffff" }}
        >
          <div className="mr-4">
            <LogoutButton />
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}
