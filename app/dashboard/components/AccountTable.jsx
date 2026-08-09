"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Popconfirm, Typography } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import styles from "../dashboard.module.css";

const { Text } = Typography;
const PAGE_SIZE = 5;

export default function AccountTable({ users, search, currentPage, setCurrentPage, onEdit, onDelete }) {
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredUsers = search.trim()
    ? users.filter((user) =>
        user.username?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : users;

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      render: (password, record) => {
        const visible = visiblePasswords[record.id];
        return (
          <Space>
            <span className={styles.password}>
              {visible ? password : "••••••••"}
            </span>
            <Button
              type="text"
              size="small"
              icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => togglePassword(record.id)}
            />
          </Space>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "Admin" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Hapus akun?"
            description="Apakah kamu yakin ingin menghapus akun ini?"
            okText="Hapus"
            cancelText="Batal"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong>
          Total Akun: {filteredUsers.length} 
          {search.trim() && ` (dari ${users.length} total)`}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Menampilkan {filteredUsers.length} dari {users.length} akun
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          onChange: setCurrentPage,
        }}
      />
    </div>
  );
}