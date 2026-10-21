"use client";

import { useMemo, useState } from "react";
import { Table, Button, Space, Tag, Popconfirm, Empty } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import styles from "./style/Accounttable.module.css";

const PAGE_SIZE = 5;

export default function AccountTable({
  users,
  search,
  currentPage,
  setCurrentPage,
  onEdit,
  onDelete,
}) {
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const keyword = search.trim().toLowerCase();
  const isSearching = keyword.length > 0;

  const filteredUsers = useMemo(() => {
    if (!isSearching) return users;
    return users.filter((user) => user.username?.toLowerCase().includes(keyword));
  }, [users, keyword, isSearching]);

  const togglePassword = (id) => {
    setVisiblePasswords((current) => ({ ...current, [id]: !current[id] }));
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      onCell: () => ({ "data-label": "Username" }),
      render: (username) => (
        <div className={styles.userCell}>
          <span className={styles.avatar}>{username?.charAt(0).toUpperCase() || "?"}</span>
          <span className={styles.username}>{username}</span>
        </div>
      ),
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      onCell: () => ({ "data-label": "Password" }),
      render: (password, record) => {
        const visible = visiblePasswords[record.id];
        return (
          <div className={styles.passwordCell}>
            <span className={styles.passwordText}>{visible ? password : "••••••••"}</span>
            <Button
              type="text"
              size="small"
              className={styles.eyeButton}
              aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
              icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => togglePassword(record.id)}
            />
          </div>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      onCell: () => ({ "data-label": "Role" }),
      width: 120,
      render: (role) => (
        <Tag color={role === "Admin" ? "blue" : "green"} className={styles.roleTag}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      onCell: () => ({ "data-label": "Aksi", className: styles.actionCell }),
      width: 220,
      render: (_, record) => (
        <Space size={8}>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            className={styles.actionButton}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus akun?"
            description="Apakah kamu yakin ingin menghapus akun ini?"
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} className={styles.actionButton}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <span className={styles.summaryTitle}>
          Total Akun
          <span className={styles.summaryBadge}>{filteredUsers.length}</span>
        </span>
        {isSearching && (
          <span className={styles.summaryHint}>
            Menampilkan {filteredUsers.length} dari {users.length} akun
          </span>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={isSearching ? "Akun tidak ditemukan" : "Belum ada akun"}
            />
          ),
        }}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          onChange: setCurrentPage,
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
      />
    </div>
  );
}