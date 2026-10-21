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
  InfoCircleOutlined,
  SafetyCertificateOutlined,
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
import InformationTable from "./components/InformationTable";
import InformationModal from "./components/InformationModal";
import styles from "./dashboard.module.css";

const SESSION_KEY = "adminSession";
const SESSION_TIMEOUT = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

const fetchCollection = async (name) => {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export default function Dashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accountOpen, setAccountOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [links, setLinks] = useState([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [linkCurrentPage, setLinkCurrentPage] = useState(1);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [linkSaving, setLinkSaving] = useState(false);

  const [infos, setInfos] = useState([]);
  const [infoSearch, setInfoSearch] = useState("");
  const [infoCurrentPage, setInfoCurrentPage] = useState(1);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [infoSaving, setInfoSaving] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (!admin) return;
    loadUsers();
    loadLinks();
    loadInfos();
    return startInactivityTimer();
  }, [admin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setLinkCurrentPage(1);
  }, [linkSearch]);

  useEffect(() => {
    setInfoCurrentPage(1);
  }, [infoSearch]);

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
    setInfos([]);
    setSelectedUser(null);
    setSelectedLink(null);
    setSelectedInfo(null);
    setAccountOpen(false);
    setLinkOpen(false);
    setInfoOpen(false);
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

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  };

  const loadUsers = async () => {
    try {
      setUsers(await fetchCollection("users"));
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data akun");
    }
  };

  const loadLinks = async () => {
    try {
      setLinks(await fetchCollection("data_link"));
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data link");
    }
  };

  const loadInfos = async () => {
    try {
      setInfos(await fetchCollection("data_information"));
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data informasi");
    }
  };

  const handleLogin = async (values) => {
    setLoginLoading(true);
    try {
      const username = values.username.trim().toLowerCase();
      const accounts = await fetchCollection("users");
      const user = accounts.find(
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

      const { password: _password, ...safeUser } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      setAdmin(safeUser);
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
    setLinkSaving(true);
    try {
      const data = {
        name: values.name.trim(),
        url: values.url.trim(),
        image: values.image?.trim() || "",
      };

      if (selectedLink) {
        await updateDoc(doc(db, "data_link", selectedLink.id), data);
        setLinks((current) =>
          current.map((item) =>
            item.id === selectedLink.id ? { ...item, ...data } : item
          )
        );
        message.success("Link berhasil diperbarui");
      } else {
        const created = await addDoc(collection(db, "data_link"), data);
        setLinks((current) => [...current, { id: created.id, ...data }]);
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

  const openAddInfoModal = () => {
    setSelectedInfo(null);
    setInfoOpen(true);
  };

  const openEditInfoModal = (info) => {
    setSelectedInfo(info);
    setInfoOpen(true);
  };

  const closeInfoModal = () => {
    setSelectedInfo(null);
    setInfoOpen(false);
  };

  const handleSaveInfo = async (values) => {
    setInfoSaving(true);
    try {
      const data = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        date: values.date.format("YYYY-MM-DD"),
        progress: values.progress,
      };

      if (selectedInfo) {
        await updateDoc(doc(db, "data_information", selectedInfo.id), data);
        setInfos((current) =>
          current.map((item) =>
            item.id === selectedInfo.id ? { ...item, ...data } : item
          )
        );
        message.success("Informasi berhasil diperbarui");
      } else {
        const created = await addDoc(collection(db, "data_information"), data);
        setInfos((current) => [...current, { id: created.id, ...data }]);
        message.success("Informasi berhasil ditambahkan");
      }

      closeInfoModal();
    } catch (error) {
      console.error(error);
      message.error("Gagal menyimpan informasi: " + error.message);
    } finally {
      setInfoSaving(false);
    }
  };

  const handleDeleteInfo = async (info) => {
    try {
      await deleteDoc(doc(db, "data_information", info.id));
      setInfos((current) => current.filter((item) => item.id !== info.id));
      message.success("Informasi berhasil dihapus");
    } catch (error) {
      console.error(error);
      message.error("Gagal menghapus informasi");
    }
  };

  const renderToolbar = ({ placeholder, value, onChange, addLabel, onAdd }) => (
    <div className={styles.toolbar}>
      <Input
        allowClear
        size="large"
        className={styles.search}
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        className={styles.addButton}
        onClick={onAdd}
      >
        {addLabel}
      </Button>
    </div>
  );

  const stats = [
    { label: "Total Akun", value: users.length, icon: <UserOutlined /> },
    {
      label: "Total Admin",
      value: users.filter((user) => user.role === "Admin").length,
      icon: <SafetyCertificateOutlined />,
    },
    { label: "Total Link", value: links.length, icon: <LinkOutlined /> },
    { label: "Total Informasi", value: infos.length, icon: <InfoCircleOutlined /> },
  ];

  const tabItems = [
    {
      key: "account",
      label: (
        <span>
          <UserOutlined /> Kelola Akun
        </span>
      ),
      children: (
        <>
          {renderToolbar({
            placeholder: "Cari username...",
            value: search,
            onChange: setSearch,
            addLabel: "Tambah Akun",
            onAdd: openAddModal,
          })}
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
        </>
      ),
    },
    {
      key: "link",
      label: (
        <span>
          <LinkOutlined /> Kelola Link
        </span>
      ),
      children: (
        <>
          {renderToolbar({
            placeholder: "Cari nama atau URL...",
            value: linkSearch,
            onChange: setLinkSearch,
            addLabel: "Tambah Link",
            onAdd: openAddLinkModal,
          })}
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
        </>
      ),
    },
    {
      key: "information",
      label: (
        <span>
          <InfoCircleOutlined /> Kelola Informasi
        </span>
      ),
      children: (
        <>
          {renderToolbar({
            placeholder: "Cari nama atau progress...",
            value: infoSearch,
            onChange: setInfoSearch,
            addLabel: "Tambah Informasi",
            onAdd: openAddInfoModal,
          })}
          <div className={styles.tableWrapper}>
            <InformationTable
              infos={infos}
              infoSearch={infoSearch}
              infoCurrentPage={infoCurrentPage}
              setInfoCurrentPage={setInfoCurrentPage}
              onEdit={openEditInfoModal}
              onDelete={handleDeleteInfo}
            />
          </div>
        </>
      ),
    },
  ];

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
              <Button size="large" icon={<HomeOutlined />} onClick={() => router.push("/")}>
                Home
              </Button>
              <Button size="large" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </header>

          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <section className={styles.content}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
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
      <InformationModal
        open={infoOpen}
        selectedInfo={selectedInfo}
        onSave={handleSaveInfo}
        onCancel={closeInfoModal}
        loading={infoSaving}
      />
    </main>
  );
}