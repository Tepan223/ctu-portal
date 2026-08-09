"use client";

import { Table, Button, Space, Popconfirm, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;
const PAGE_SIZE = 5;

export default function LinkTable({ 
  links, 
  linkSearch, 
  linkCurrentPage, 
  setLinkCurrentPage, 
  onEdit, 
  onDelete 
}) {
  const filteredLinks = linkSearch.trim()
    ? links.filter(
        (link) =>
          link.name?.toLowerCase().includes(linkSearch.trim().toLowerCase()) ||
          link.url?.toLowerCase().includes(linkSearch.trim().toLowerCase())
      )
    : links;

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image, record) =>
        image ? (
          <img
            src={image}
            alt={record.name || "Link"}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #eee",
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentNode;
              const placeholder = document.createElement('span');
              placeholder.textContent = '🔗';
              placeholder.style.fontSize = '30px';
              parent.appendChild(placeholder);
            }}
          />
        ) : (
          <span style={{ fontSize: '24px' }}>🔗</span>
        ),
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              maxWidth: 350,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {url}
          </a>
        ) : "-",
    },
    {
      title: "Action",
      key: "action",
      width: 190,
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Hapus link?"
            description="Apakah kamu yakin ingin menghapus link ini?"
            okText="Hapus"
            cancelText="Batal"
            onConfirm={() => onDelete(record)}
          >
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <Text strong>
          Total Link: {filteredLinks.length}
          {linkSearch.trim() && ` (dari ${links.length} total)`}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Menampilkan {filteredLinks.length} dari {links.length} Link
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLinks}
        rowKey="id"
        pagination={{
          current: linkCurrentPage,
          pageSize: PAGE_SIZE,
          onChange: setLinkCurrentPage,
        }}
      />
    </div>
  );
}