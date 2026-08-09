"use client";

import {
  Modal,
  Form,
  Input,
  Button,
} from "antd";

import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

export default function LoginModal({
  open,
  loading,
  onLogin,
}) {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const success = await onLogin(values);

    if (success) {
      form.resetFields();
    }
  };

  return (
    <Modal
      title="Login Admin"
      open={open}
      footer={null}
      closable={false}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Password wajib diisi",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
        >
          Login
        </Button>
      </Form>
    </Modal>
  );
}