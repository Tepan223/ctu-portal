
"use client";

import { useMemo } from "react";
import { Table, Button, Space, Tag, Popconfirm, Empty } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styles from "./style/Informationtable.module.css";

const PAGE_SIZE = 5;

const PROGRESS_STYLE = {
  "Belum Dikerjakan": { color: "default", icon: <ClockCircleOutlined /> },
  "Dalam Pengerjaan": { color: "processing", icon: <SyncOutlined spin /> },
  Selesai: { color: "success", icon: <CheckCircleOutlined /> },
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStartDate = (record) => record.startDate || record.date || "";
const getEndDate = (record) => record.endDate || record.date || "";

export default function InformationTable({
  infos,
  infoSearch,
  infoCurrentPage,
  setInfoCurrentPage,
  onEdit,
  onDelete,
}) {
  const keyword = (infoSearch || "").trim().toLowerCase();
  const isSearching = keyword.length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return infos;

    return infos.filter(
      (item) =>
        item.name?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.progress?.toLowerCase().includes(keyword)
    );
  }, [infos, keyword, isSearching]);

  const columns = [
    {
      title: "Nama Project",
      dataIndex: "name",
      key: "name",
      onCell: () => ({ "data-label": "Nama" }),
      render: (name) => (
        <div className={styles.nameCell}>
          <span className={styles.avatar}>
            {name?.charAt(0).toUpperCase() || "?"}
          </span>
          <span className={styles.name}>{name}</span>
        </div>
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      onCell: () => ({ "data-label": "Deskripsi" }),
      ellipsis: true,
      render: (text) => (
        <span className={styles.description}>{text || "-"}</span>
      ),
    },
    {
      title: "Rentang Tanggal",
      key: "dateRange",
      onCell: () => ({ "data-label": "Rentang Tanggal" }),
      width: 230,
      sorter: (a, b) =>
        new Date(getStartDate(a) || 0) -
        new Date(getStartDate(b) || 0),
      render: (_, record) => (
        <span className={styles.date}>
          {formatDate(getStartDate(record))}
          {" - "}
          {formatDate(getEndDate(record))}
        </span>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      onCell: () => ({ "data-label": "Progress" }),
      width: 190,
      filters: Object.keys(PROGRESS_STYLE).map((item) => ({
        text: item,
        value: item,
      })),
      onFilter: (value, record) => record.progress === value,
      render: (progress) => {
        const style =
          PROGRESS_STYLE[progress] ??
          PROGRESS_STYLE["Belum Dikerjakan"];

        return (
          <Tag
            color={style.color}
            icon={style.icon}
            className={styles.statusTag}
          >
            {progress || "Belum Dikerjakan"}
          </Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      onCell: () => ({
        "data-label": "Aksi",
        className: styles.actionCell,
      }),
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
            title="Hapus informasi?"
            description="Apakah kamu yakin ingin menghapus informasi ini?"
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              className={styles.actionButton}
            >
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
          Total Informasi
          <span className={styles.summaryBadge}>{filtered.length}</span>
        </span>

        {isSearching && (
          <span className={styles.summaryHint}>
            Menampilkan {filtered.length} dari {infos.length} informasi
          </span>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                isSearching
                  ? "Informasi tidak ditemukan"
                  : "Belum ada informasi"
              }
            />
          ),
        }}
        pagination={{
          current: infoCurrentPage,
          pageSize: PAGE_SIZE,
          onChange: setInfoCurrentPage,
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
      />
    </div>
  );
}
