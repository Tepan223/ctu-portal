"use client";

import { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { LinkOutlined } from "@ant-design/icons";

export default function LinkModal({ 
  open, 
  selectedLink, 
  onSave, 
  onCancel, 
  loading 
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (selectedLink) {
        form.setFieldsValue({
          name: selectedLink.name || "",
          url: selectedLink.url || "",
          image: selectedLink.image || "",
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedLink, form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={selectedLink ? "Edit Link" : "Tambah Link Baru"}
      open={open}
      onCancel={handleCancel}
      okText={selectedLink ? "Simpan Perubahan" : "Tambah"}
      cancelText="Batal"
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
        initialValues={{ name: "", url: "", image: "" }}
      >
        <Form.Item
          label="Nama Link"
          name="name"
          rules={[{ required: true, message: "Masukkan nama link!" }]}
        >
          <Input placeholder="Contoh: Google" />
        </Form.Item>

        <Form.Item
          label="URL"
          name="url"
          rules={[
            { required: true, message: "Masukkan URL link!" },
            { type: "url", message: "Masukkan URL yang valid!" },
          ]}
        >
          <Input placeholder="https://google.com" />
        </Form.Item>

        <Form.Item
          label="URL Gambar (opsional)"
          name="image"
          tooltip="Masukkan URL gambar dari internet (Google Images, Imgur, dll)"
          rules={[
            { 
              type: "url", 
              message: "Masukkan URL yang valid!",
              required: false 
            },
          ]}
        >
          <Input 
            placeholder="https://example.com/image.jpg" 
            prefix={<LinkOutlined />}
          />
        </Form.Item>

        <Form.Item shouldUpdate>
          {({ getFieldValue }) => {
            const imageUrl = getFieldValue('image');
            return imageUrl ? (
              <div style={{ marginTop: 8 }}>
                <p style={{ marginBottom: 8, color: '#666' }}>Preview Gambar:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : null;
          }}
        </Form.Item>

        <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
          💡 Tips: Cari gambar di Google Images, klik kanan → "Copy Image Address"
        </div>
      </Form>
    </Modal>
  );
}