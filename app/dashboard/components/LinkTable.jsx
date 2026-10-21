"use client";

import { useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm, Empty } from "antd";
import { EditOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import styles from "./style/Linktable.module.css";

const PAGE_SIZE = 5;

function LinkImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={styles.imagePlaceholder}>
        <LinkOutlined />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={styles.image}
      onError={() => setFailed(true)}
    />
  );
}

export default function LinkTable({
  links,
  linkSearch,
  linkCurrentPage,
  setLinkCurrentPage,
  onEdit,
  onDelete,
}) {
  const keyword = linkSearch.trim().toLowerCase();
  const isSearching = keyword.length > 0;

  const filteredLinks = useMemo(() => {
    if (!isSearching) return links;
    return links.filter(
      (link) =>
        link.name?.toLowerCase().includes(keyword) ||
        link.url?.toLowerCase().includes(keyword)
    );
  }, [links, keyword, isSearching]);

  const columns = [
    {
      title: "Gambar",
      dataIndex: "image",
      key: "image",
      width: 100,
      onCell: () => ({ "data-label": "Gambar" }),
      render: (image, record) => (
        <LinkImage key={image} src={image} alt={record.name || "Link"} />
      ),
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      onCell: () => ({ "data-label": "Nama" }),
      render: (name) => <span className={styles.name}>{name || "-"}</span>,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      onCell: () => ({ "data-label": "URL" }),
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
            {url}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 220,
      onCell: () => ({ "data-label": "Aksi", className: styles.actionCell }),
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
            title="Hapus link?"
            description="Apakah kamu yakin ingin menghapus link ini?"
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record)}
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
          Total Link
          <span className={styles.summaryBadge}>{filteredLinks.length}</span>
        </span>
        {isSearching && (
          <span className={styles.summaryHint}>
            Menampilkan {filteredLinks.length} dari {links.length} link
          </span>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filteredLinks}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={isSearching ? "Link tidak ditemukan" : "Belum ada link"}
            />
          ),
        }}
        pagination={{
          current: linkCurrentPage,
          pageSize: PAGE_SIZE,
          onChange: setLinkCurrentPage,
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
      />
    </div>
  );
}