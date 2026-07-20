"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

export default function UserModal({
  open,
  onCancel,
  onSave,
  initialValues,
}) {
  const [form] = Form.useForm();
  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        username: initialValues.username,
        role: initialValues.role,
        password: "", // Dikosongkan saat edit demi keamanan
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleFinish = async (values) => {
    await onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      title={isEditing ? "Edit Akun" : "Tambah Akun"}
      open={open}
      destroyOnHidden
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText={isEditing ? "Simpan" : "Tambah"}
      cancelText="Batal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
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
          <Input placeholder="Masukkan username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          extra={isEditing ? "Kosongkan jika tidak ingin mengubah password" : ""}
          rules={[
            {
              required: !isEditing, // Wajib saat Tambah, Opsional saat Edit
              message: "Password wajib diisi",
            },
            {
              min: 6,
              message: "Password minimal 6 karakter (ketentuan Firebase Auth)",
            },
          ]}
        >
          <Input.Password 
            placeholder={isEditing ? "Password baru (opsional)" : "Masukkan password"} 
          />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[
            {
              required: true,
              message: "Pilih role",
            },
          ]}
        >
          <Select
            placeholder="Pilih role"
            options={[
              {
                value: "Admin",
                label: "Admin",
              },
              {
                value: "User",
                label: "User",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}