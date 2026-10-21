"use client";

import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateFilled,
  WarningOutlined,
} from "@ant-design/icons";

import styles from "./style/Loginmodal.module.css";

export default function LoginModal({ open, loading, onLogin }) {
  const [form] = Form.useForm();
  const [capsOn, setCapsOn] = useState(false);

  const handleSubmit = async (values) => {
    const success = await onLogin(values);

    if (success) {
      form.resetFields();
    }
  };

  return (
    <Modal
      open={open}
      footer={null}
      title={null}
      closable={false}
      keyboard={false}
      mask={{ closable: false }}
      centered
      width="min(400px, calc(100vw - 32px))"
      rootClassName={styles.modalRoot}
      afterClose={() => setCapsOn(false)}
    >
      <div className={styles.panel}>
        <div className={styles.iconWrap}>
          <SafetyCertificateFilled className={styles.icon} />
        </div>

        <h2 className={styles.title}>Login Admin</h2>
        <p className={styles.subtitle}>Masuk untuk mengelola daftar link portal.</p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
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
              autoCapitalize="off"
              autoComplete="username"
              autoFocus
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password wajib diisi." }]}
            style={{ marginBottom: capsOn ? 8 : 24 }}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Masukkan password"
              autoComplete="current-password"
              className={styles.input}
              onKeyUp={(e) => setCapsOn(!!e.getModifierState?.("CapsLock"))}
              onBlur={() => setCapsOn(false)}
            />
          </Form.Item>

          {capsOn && (
            <p className={styles.caps} role="alert">
              <WarningOutlined /> Caps Lock sedang aktif.
            </p>
          )}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<LoginOutlined />}
            className={styles.submit}
          >
            Login
          </Button>
        </Form>
      </div>
    </Modal>
  );
}