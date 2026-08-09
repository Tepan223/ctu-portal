"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

import { Modal, Form, Input, Button, message, Space, Tag, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  LockFilled,
} from "@ant-design/icons";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SESSION_KEY = "userSession";
const SESSION_TIMEOUT = 30 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginForm] = Form.useForm();

  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    checkSession();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      return startInactivityTimer();
    }
  }, [currentUser]);

  const checkSession = () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation?.type === "reload") {
      localStorage.removeItem(SESSION_KEY);
      setIsLoginModalOpen(true);
      setIsCheckingSession(false);
      return;
    }

    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setCurrentUser(parsedUser);
        fetchLinks();
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
    setIsCheckingSession(false);
  };

  const startInactivityTimer = () => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleSessionTimeout();
      }, SESSION_TIMEOUT);
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  };

  const handleSessionTimeout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setLinks([]);
    setIsLoginModalOpen(true);
    message.warning("Session berakhir karena tidak aktif selama 30 detik.");
  };

  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const snapshot = await getDocs(collection(db, "data_link"));
      const linkList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinks(linkList);
    } catch {
      message.error("Gagal memuat daftar link");
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleLoginSubmit = async (values) => {
    setLoginLoading(true);
    try {
      const inputUsername = values.username.trim();
      const inputPassword = values.password;

      const snapshot = await getDocs(collection(db, "users"));

      let foundUser = null;

      snapshot.docs.forEach((doc) => {
        const userData = doc.data();
        if (userData.username?.toLowerCase() === inputUsername.toLowerCase()) {
          foundUser = userData;
        }
      });

      if (!foundUser) {
        message.error("Username atau password salah!");
        return;
      }

      if (foundUser.password !== inputPassword) {
        message.error("Username atau password salah!");
        return;
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
      setCurrentUser(foundUser);
      setIsLoginModalOpen(false);
      loginForm.resetFields();

      message.success(`Selamat datang, ${foundUser.username}!`);
      fetchLinks();
    } catch {
      message.error("Terjadi kesalahan saat login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
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
        <div className={styles.topBar}>
          <Link
            href="https://ctu-indonesia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.logo}
          >
            <img src="/Logo-CTU.png" alt="Logo" className={styles.logo_img} />
          </Link>

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

                <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
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

        {currentUser ? (
          loadingLinks ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" description="Memuat daftar link..." />
            </div>
          ) : links.length > 0 ? (
            <div className={styles.links}>
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {link.image ? (
                      <img
                        src={link.image}
                        alt={link.name || "Link"}
                        className={styles.cardImg}
                      />
                    ) : (
                      <span className={styles.cardIcon}>🔗</span>
                    )}
                  </div>
                  <div className={styles.cardTitle}>
                    {link.name || link.title || "Link"}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <p style={{ color: "#999", fontSize: 16 }}>Belum ada link yang tersedia.</p>
              <p style={{ color: "#ccc", fontSize: 14 }}>
                Silakan tambahkan link melalui dashboard admin.
              </p>
            </div>
          )
        ) : (
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
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              autoCapitalize="off"
            />
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