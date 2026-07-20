"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import { Modal, Form, Input, Button, message, Space, Tag, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  LockFilled,
} from "@ant-design/icons";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginForm] = Form.useForm();

  // State untuk data link dari Firestore
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  // 1. Cek Sesi saat Halaman Dimuat
  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setCurrentUser(parsedUser);
        fetchLinks(); // Ambil data links jika sudah ada sesi login
      } catch (err) {
        localStorage.removeItem("userSession");
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
    setIsCheckingSession(false);
  }, []);

  // 2. Fungsi Ambil Data Links dari Firestore
  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const snapshot = await getDocs(collection(db, "links"));
      const linkList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinks(linkList);
    } catch (error) {
      console.error("Gagal mengambil data links:", error);
      message.error("Gagal memuat daftar link dari Firestore");
    } finally {
      setLoadingLinks(false);
    }
  };

  // 3. Fungsi Submit Login
  const handleLoginSubmit = async (values) => {
    setLoginLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", values.username),
        where("password", "==", values.password)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        message.error("Username atau password salah!");
        return;
      }

      const userData = querySnapshot.docs[0].data();

      localStorage.setItem("userSession", JSON.stringify(userData));
      setCurrentUser(userData);
      setIsLoginModalOpen(false);
      loginForm.resetFields();

      message.success(`Selamat datang, ${userData.username}!`);
      fetchLinks(); // Memuat link dari Firestore setelah login berhasil
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat login");
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setCurrentUser(null);
    setLinks([]);
    setIsLoginModalOpen(true);
    message.success("Berhasil logout");
  };

  if (isCheckingSession) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" description="Memeriksa sesi..." />
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.linkCard}>
        {/* Header Bar */}
        <div className={styles.topBar}>
          <img src="/Logo-CTU.png" alt="Logo" className={styles.logo} />

          <Space className={styles.userActionArea}>
            {currentUser ? (
              <>
                <Tag color={currentUser.role === "Admin" ? "blue" : "green"}>
                  {currentUser.username} ({currentUser.role})
                </Tag>

                {currentUser.role === "Admin" && (
                  <Button
                    type="primary"
                    icon={<DashboardOutlined />}
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </Button>
                )}

                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
            )}
          </Space>
        </div>

        <h1 className={styles.header}>CTU PORTAL</h1>

        {/* Cek Akses & Tampilkan Link dari Firestore */}
        {currentUser ? (
          loadingLinks ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" description="Memuat daftar link..." />
            </div>
          ) : (
            <div className={styles.links}>
              {links.map((link) => (
                <a
                  key={link.id || link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <div className={styles.left}>
                    <span className={styles.icon}>{link.icon}</span>
                    <span className={styles.title}>{link.title}</span>
                  </div>
                </a>
              ))}
            </div>
          )
        ) : (
          /* Tampilan saat Belum Login */
          <div className={styles.lockedContainer}>
            <LockFilled className={styles.lockedIcon} />
            <p className={styles.lockedText}>
              Akses terkunci. Silakan login terlebih dahulu untuk mengakses portal CTU.
            </p>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => setIsLoginModalOpen(true)}
            >
              Masuk Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* Modal Login */}
      <Modal
        title="Login"
        open={isLoginModalOpen}
        onCancel={() => {
          if (currentUser) setIsLoginModalOpen(false);
        }}
        footer={null}
        closable={!!currentUser}
        mask={{ closable: !!currentUser }}
        centered
      >
        <Form form={loginForm} layout="vertical" onFinish={handleLoginSubmit}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Masukkan username Anda!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Masukkan password Anda!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginLoading}
            >
              Masuk
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}