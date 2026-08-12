"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Space, Input, message, Tabs } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  LogoutOutlined,
  HomeOutlined,
  UserOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoginModal from "./components/LoginModal";
import AccountModal from "./components/AccountModal";
import AccountTable from "./components/AccountTable";
import LinkTable from "./components/LinkTable";
import LinkModal from "./components/LinkModal";
import styles from "./dashboard.module.css";

const SESSION_KEY = "adminSession";
const SESSION_TIMEOUT = 5 * 60 * 1000; 
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export default function Dashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [linkCurrentPage, setLinkCurrentPage] = useState(1);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [linkSaving, setLinkSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (!admin) return;
    loadUsers();
    loadLinks();
    return startInactivityTimer();
  }, [admin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setLinkCurrentPage(1);
  }, [linkSearch]);

  const initializeSession = () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation?.type === "reload") {
      clearSession();
      return;
    }

    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      setLoginOpen(true);
      return;
    }

    try {
      const user = JSON.parse(session);
      if (user.role !== "Admin") {
        clearSession();
        return;
      }
      setAdmin(user);
    } catch {
      clearSession();
    }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setAdmin(null);
    setUsers([]);
    setLinks([]);
    setSelectedUser(null);
    setSelectedLink(null);
    setAccountOpen(false);
    setLinkOpen(false);
    setLoginOpen(true);
  };

  const startInactivityTimer = () => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearSession();
        message.warning("Session berakhir karena tidak aktif selama 5 menit.");
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

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setUsers(data);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data akun");
    }
  };

  const loadLinks = async () => {
    try {
      const snapshot = await getDocs(collection(db, "data_link"));
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setLinks(data);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data link");
    }
  };

  const handleLogin = async (values) => {
    setLoginLoading(true);
    try {
      const username = values.username.trim().toLowerCase();
      const snapshot = await getDocs(collection(db, "users"));
      const user = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .find(
          (item) =>
            item.username?.trim().toLowerCase() === username &&
            item.password === values.password
        );

      if (!user) {
        message.error("Username atau password salah");
        return false;
      }

      if (user.role !== "Admin") {
        message.error("Akun bukan Admin");
        return false;
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setAdmin(user);
      setLoginOpen(false);
      message.success("Login berhasil");
      return true;
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat login");
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    message.success("Berhasil logout");
  };

  const handleHome = () => {
    router.push("/");
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setAccountOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setAccountOpen(true);
  };

  const closeAccountModal = () => {
    setSelectedUser(null);
    setAccountOpen(false);
  };

  const handleSave = async (values) => {
    try {
      if (selectedUser) {
        const data = { username: values.username, role: values.role };
        if (values.password) {
          data.password = values.password;
        }
        await updateDoc(doc(db, "users", selectedUser.id), data);
        message.success("Akun berhasil diperbarui");
      } else {
        await addDoc(collection(db, "users"), {
          username: values.username,
          password: values.password,
          role: values.role,
        });
        message.success("Akun berhasil ditambahkan");
      }
      closeAccountModal();
      await loadUsers();
    } catch (error) {
      console.error(error);
      message.error("Gagal menyimpan akun");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((current) => current.filter((user) => user.id !== id));
      message.success("Akun berhasil dihapus");
    } catch (error) {
      console.error(error);
      message.error("Gagal menghapus akun");
    }
  };

  const openAddLinkModal = () => {
    setSelectedLink(null);
    setLinkOpen(true);
  };

  const openEditLinkModal = (link) => {
    setSelectedLink(link);
    setLinkOpen(true);
  };

  const closeLinkModal = () => {
    setSelectedLink(null);
    setLinkOpen(false);
  };

  const handleSaveLink = async (values) => {
    try {
      setLinkSaving(true);

      if (values.image && !values.image.match(/^https?:\/\/.+/)) {
        message.warning("URL gambar tidak valid, akan diabaikan");
        values.image = "";
      }

      const data = {
        name: values.name.trim(),
        url: values.url.trim(),
        image: values.image?.trim() || "",
      };

      if (selectedLink) {
        await updateDoc(doc(db, "data_link", selectedLink.id), data);
        setLinks((prev) =>
          prev.map((item) =>
            item.id === selectedLink.id ? { ...item, ...data } : item
          )
        );
        message.success("Link berhasil diperbarui");
      } else {
        const newLink = await addDoc(collection(db, "data_link"), data);
        setLinks((prev) => [
          ...prev,
          {
            id: newLink.id,
            ...data,
          },
        ]);
        message.success("Link berhasil ditambahkan");
      }

      closeLinkModal();
    } catch (error) {
      console.error(error);
      message.error("Gagal menyimpan link: " + error.message);
    } finally {
      setLinkSaving(false);
    }
  };

  const handleDeleteLink = async (link) => {
    try {
      await deleteDoc(doc(db, "data_link", link.id));
      setLinks((current) => current.filter((item) => item.id !== link.id));
      message.success("Link berhasil dihapus");
    } catch (error) {
      console.error(error);
      message.error("Gagal menghapus link");
    }
  };

  const accountTab = {
    key: "account",
    label: (
      <span>
        <UserOutlined /> Kelola Akun
      </span>
    ),
    children: (
      <div>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Input
            className={styles.search}
            prefix={<SearchOutlined />}
            placeholder="Cari username..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <div className={styles.tableWrapper}>
          <AccountTable
            users={users}
            search={search}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      </div>
    ),
  };

  const linkTab = {
    key: "link",
    label: (
      <span>
        <LinkOutlined /> Kelola Link
      </span>
    ),
    children: (
      <div>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Input
            className={styles.search}
            prefix={<SearchOutlined />}
            placeholder="Cari nama atau URL..."
            value={linkSearch}
            onChange={(event) => setLinkSearch(event.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <div className={styles.tableWrapper}>
          <LinkTable
            links={links}
            linkSearch={linkSearch}
            linkCurrentPage={linkCurrentPage}
            setLinkCurrentPage={setLinkCurrentPage}
            onEdit={openEditLinkModal}
            onDelete={handleDeleteLink}
          />
        </div>
      </div>
    ),
  };

  return (
    <main className={styles.page}>
      {admin && (
        <section className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Dashboard Admin</h1>
              <p className={styles.welcome}>
                Selamat datang, <strong>{admin.username}</strong>
              </p>
            </div>
            <Space wrap>
              <Button icon={<HomeOutlined />} onClick={handleHome}>
                Home
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={activeTab === "link" ? openAddLinkModal : openAddModal}
              >
                {activeTab === "link" ? "Tambah Link" : "Tambah Akun"}
              </Button>
              <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </header>
          <section className={styles.content}>
            <Tabs
              defaultActiveKey="account"
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[accountTab, linkTab]}
            />
          </section>
        </section>
      )}

      <LoginModal open={loginOpen} loading={loginLoading} onLogin={handleLogin} />
      <AccountModal
        open={accountOpen}
        selectedUser={selectedUser}
        onSave={handleSave}
        onCancel={closeAccountModal}
      />
      <LinkModal
        open={linkOpen}
        selectedLink={selectedLink}
        onSave={handleSaveLink}
        onCancel={closeLinkModal}
        loading={linkSaving}
      />
    </main>
  );
}