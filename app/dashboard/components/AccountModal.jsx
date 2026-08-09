"use client";

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
} from "antd";

export default function AccountModal({
  open,
  selectedUser,
  onSave,
  onCancel,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    if (selectedUser) {
      form.setFieldsValue({
        username: selectedUser.username,
        role: selectedUser.role,
        password: "",
      });
    } else {
      form.resetFields();
      form.setFieldValue("role", "User");
    }
  }, [open, selectedUser, form]);

  return (
    <Modal
      title={selectedUser ? "Edit Akun" : "Tambah Akun"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Simpan"
      cancelText="Batal"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Username wajib diisi",
            },
          ]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: !selectedUser,
              message: "Password wajib diisi",
            },
          ]}
        >
          <Input.Password
            placeholder={
              selectedUser
                ? "Kosongkan jika tidak diubah"
                : "Password"
            }
          />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[
            {
              required: true,
              message: "Role wajib dipilih",
            },
          ]}
        >
          <Select
            options={[
              {
                label: "Admin",
                value: "Admin",
              },
              {
                label: "User",
                value: "User",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}