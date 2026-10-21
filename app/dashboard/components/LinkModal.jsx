"use client";

import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import {
  LinkOutlined,
  GlobalOutlined,
  TagOutlined,
  PictureOutlined,
  PlusOutlined,
  EditOutlined,
  BulbOutlined,
} from "@ant-design/icons";

import styles from "./style/Linkmodal.module.css";

function ImagePreview({ src }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.preview}>
      <span className={styles.previewLabel}>Preview gambar</span>
      {failed ? (
        <span className={styles.previewError}>Gambar tidak dapat dimuat</span>
      ) : (
        <img
          src={src}
          alt="Preview"
          className={styles.previewImg}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function LinkModal({ open, selectedLink, onSave, onCancel, loading }) {
  const [form] = Form.useForm();
  const imageUrl = Form.useWatch("image", form);
  const isEdit = !!selectedLink;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={null}
      destroyOnHidden
      centered
      width="min(560px, calc(100vw - 32px))"
      rootClassName={styles.modalRoot}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            {isEdit ? <EditOutlined /> : <PlusOutlined />}
          </div>
          <div>
            <h2 className={styles.title}>{isEdit ? "Edit Link" : "Tambah Link Baru"}</h2>
            <p className={styles.subtitle}>
              {isEdit
                ? "Ubah informasi link yang tampil di portal."
                : "Isi detail link yang akan tampil di portal."}
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          preserve={false}
          requiredMark={false}
          onFinish={onSave}
          initialValues={{
            name: selectedLink?.name ?? "",
            url: selectedLink?.url ?? "",
            image: selectedLink?.image ?? "",
          }}
          className={styles.form}
        >
          <Form.Item
            label="Nama Link"
            name="name"
            rules={[{ required: true, message: "Nama link wajib diisi." }]}
          >
            <Input
              size="large"
              prefix={<TagOutlined />}
              placeholder="Contoh: Google"
              autoFocus
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
            rules={[
              { required: true, message: "URL wajib diisi." },
              { type: "url", message: "Masukkan URL yang valid." },
            ]}
          >
            <Input
              size="large"
              prefix={<GlobalOutlined />}
              placeholder="https://google.com"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="URL Gambar (opsional)"
            name="image"
            rules={[{ type: "url", message: "Masukkan URL yang valid." }]}
          >
            <Input
              size="large"
              prefix={<PictureOutlined />}
              placeholder="https://example.com/image.jpg"
              className={styles.input}
            />
          </Form.Item>

          {imageUrl && <ImagePreview key={imageUrl} src={imageUrl} />}

          <p className={styles.tips}>
            <BulbOutlined />
            <span>
              Cari gambar di Google Images, klik kanan lalu pilih &quot;Copy Image Address&quot;.
            </span>
          </p>

          <div className={styles.footer}>
            <Button size="large" className={styles.cancelButton} onClick={onCancel}>
              Batal
            </Button>
            <Button
              type="primary"
              size="large"
              icon={isEdit ? <EditOutlined /> : <LinkOutlined />}
              loading={loading}
              className={styles.submitButton}
              onClick={() => form.submit()}
            >
              {isEdit ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}