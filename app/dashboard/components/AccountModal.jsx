"use client";

import { useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import {
  UserOutlined,
  LockOutlined,
  UserAddOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import styles from "./style/Accountmodal.module.css";

const ROLE_OPTIONS = [
  { label: "Admin", value: "Admin" },
  { label: "User", value: "User" },
];

export default function AccountModal({ open, selectedUser, onSave, onCancel }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!selectedUser;

  const handleFinish = async (values) => {
    setSaving(true);
    try {
      await onSave(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={null}
      destroyOnHidden
      centered
      width="min(480px, calc(100vw - 32px))"
      rootClassName={styles.modalRoot}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            {isEdit ? <EditOutlined /> : <UserAddOutlined />}
          </div>
          <div>
            <h2 className={styles.title}>{isEdit ? "Edit Akun" : "Tambah Akun"}</h2>
            <p className={styles.subtitle}>
              {isEdit
                ? "Ubah data akun yang sudah terdaftar."
                : "Buat akun baru untuk mengakses portal."}
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          preserve={false}
          requiredMark={false}
          onFinish={handleFinish}
          initialValues={{
            username: selectedUser?.username ?? "",
            password: "",
            role: selectedUser?.role ?? "User",
          }}
          className={styles.form}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Username wajib diisi." }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Masukkan username"
              autoComplete="off"
              autoFocus
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            extra={isEdit ? "Kosongkan jika password tidak ingin diubah." : null}
            rules={[{ required: !isEdit, message: "Password wajib diisi." }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder={isEdit ? "Password baru (opsional)" : "Masukkan password"}
              autoComplete="new-password"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Role wajib dipilih." }]}
          >
            <Select size="large" options={ROLE_OPTIONS} className={styles.select} />
          </Form.Item>

          <div className={styles.footer}>
            <Button size="large" className={styles.cancelButton} onClick={onCancel}>
              Batal
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={saving}
              className={styles.submitButton}
              onClick={() => form.submit()}
            >
              Simpan
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}