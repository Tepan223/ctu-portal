"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

import {
  Table,
  Button,
  Space,
  Input,
  Popconfirm,
  Card,
  Tag,
  message,
  Modal,
  Form,
  Spin,
  Tabs,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  LinkOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function Dashboard() {
  const router = useRouter();

  // State Autentikasi
  const [adminUser, setAdminUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginForm] = Form.useForm();

  // State Tab Aktif ('users' atau 'links')
  const [activeTab, setActiveTab] = useState("users");

  // State Data Users
  const [users, setUsers] = useState([]);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [searchUser, setSearchUser] = useState("");
  const [userForm] = Form.useForm();

  // State Data Links
  const [links, setLinks] = useState([]);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [searchLink, setSearchLink] = useState("");
  const [linkForm] = Form.useForm();

  // 1. Cek Sesi Login saat Komponen Dimuat
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const session = localStorage.getItem("userSession");

    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role === "Admin") {
          setAdminUser(parsed);
          setIsLoginModalOpen(false);
          fetchUsers();
          fetchLinks();
        } else {
          localStorage.removeItem("userSession");
          setIsLoginModalOpen(true);
        }
      } catch (err) {
        localStorage.removeItem("userSession");
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }

    setIsCheckingAuth(false);
  };

  // 2. Login Modal Submit
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

      if (userData.role !== "Admin") {
        message.error("Akses ditolak! Akun ini bukan Admin.");
        return;
      }

      localStorage.setItem("userSession", JSON.stringify(userData));
      setAdminUser(userData);
      setIsLoginModalOpen(false);
      loginForm.resetFields();
      message.success("Login Admin berhasil!");

      fetchUsers();
      fetchLinks();
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat login");
    } finally {
      setLoginLoading(false);
    }
  };

  // 3. Logout
  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setAdminUser(null);
    setUsers([]);
    setLinks([]);
    setIsLoginModalOpen(true);
    message.success("Berhasil logout");
  };

  // ==========================================
  // 4. LOGIKA CRUD USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(
        snapshot.docs.map((item) => ({
          key: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      console.log(error);
      message.error("Gagal mengambil data users");
    }
  };

  // Buka Modal User (HANYA MENGATUR STATE, TANPA PANGGIL FORM METHOD SAMA SEKALI)
  const handleOpenUserModal = (record = null) => {
    setSelectedUser(record);
    setOpenUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userForm.validateFields();

      if (selectedUser) {
        const updatedValues = { ...values };
        if (!updatedValues.password || updatedValues.password.trim() === "") {
          delete updatedValues.password;
        }

        await updateDoc(doc(db, "users", selectedUser.key), updatedValues);

        setUsers((prev) =>
          prev.map((item) =>
            item.key === selectedUser.key
              ? {
                  ...item,
                  ...updatedValues,
                  password: updatedValues.password ?? item.password,
                }
              : item
          )
        );
        message.success("Akun berhasil diperbarui");
      } else {
        const check = query(
          collection(db, "users"),
          where("username", "==", values.username)
        );

        const result = await getDocs(check);
        if (!result.empty) {
          message.error("Username sudah digunakan!");
          return;
        }

        const newUser = await addDoc(collection(db, "users"), values);

        setUsers((prev) => [
          ...prev,
          {
            key: newUser.id,
            ...values,
          },
        ]);
        message.success("Akun berhasil dibuat");
      }

      setOpenUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.log("Validation / Save Error:", error);
    }
  };

  const handleDeleteUser = async (key) => {
    try {
      await deleteDoc(doc(db, "users", key));
      setUsers((prev) => prev.filter((item) => item.key !== key));
      message.success("Akun berhasil dihapus");
    } catch (error) {
      console.log(error);
      message.error("Gagal menghapus akun");
    }
  };

  // ==========================================
  // 5. LOGIKA CRUD LINKS
  // ==========================================
  const fetchLinks = async () => {
    try {
      const snapshot = await getDocs(collection(db, "links"));
      setLinks(
        snapshot.docs.map((item) => ({
          key: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      console.log(error);
      message.error("Gagal mengambil data links");
    }
  };

  // Buka Modal Link (HANYA MENGATUR STATE, TANPA PANGGIL FORM METHOD SAMA SEKALI)
  const handleOpenLinkModal = (record = null) => {
    setSelectedLink(record);
    setOpenLinkModal(true);
  };

  const handleSaveLink = async () => {
    try {
      const values = await linkForm.validateFields();

      if (selectedLink) {
        await updateDoc(doc(db, "links", selectedLink.key), values);

        setLinks((prev) =>
          prev.map((item) =>
            item.key === selectedLink.key ? { ...item, ...values } : item
          )
        );
        message.success("Link berhasil diperbarui");
      } else {
        const newLink = await addDoc(collection(db, "links"), values);

        setLinks((prev) => [
          ...prev,
          {
            key: newLink.id,
            ...values,
          },
        ]);
        message.success("Link berhasil ditambahkan");
      }

      setOpenLinkModal(false);
      setSelectedLink(null);
    } catch (error) {
      console.log("Validation / Save Error:", error);
    }
  };

  const handleDeleteLink = async (key) => {
    try {
      await deleteDoc(doc(db, "links", key));
      setLinks((prev) => prev.filter((item) => item.key !== key));
      message.success("Link berhasil dihapus");
    } catch (error) {
      console.log(error);
      message.error("Gagal menghapus link");
    }
  };

  const togglePassword = (key) => {
    setShowPassword((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter Data
  const filteredUsers = users.filter((item) =>
    item.username?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLinks = links.filter((item) =>
    item.title?.toLowerCase().includes(searchLink.toLowerCase())
  );

  // Kolom Tabel Users
  const userColumns = [
    {
      title: "Username",
      dataIndex: "username",
    },
    {
      title: "Password",
      dataIndex: "password",
      render: (password, record) => (
        <Space>
          <span>{showPassword[record.key] ? password : "••••••••"}</span>
          <Button
            type="text"
            icon={
              showPassword[record.key] ? (
                <EyeInvisibleOutlined />
              ) : (
                <EyeOutlined />
              )
            }
            onClick={() => togglePassword(record.key)}
          />
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "Admin" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleOpenUserModal(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Hapus akun ini?"
            okText="Hapus"
            cancelText="Batal"
            onConfirm={() => handleDeleteUser(record.key)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Kolom Tabel Links
  const linkColumns = [
    {
      title: "Icon",
      dataIndex: "icon",
      width: 80,
      render: (icon) => <span style={{ fontSize: "20px" }}>{icon}</span>,
    },
    {
      title: "Judul Link",
      dataIndex: "title",
    },
    {
      title: "URL",
      dataIndex: "url",
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: "Action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleOpenLinkModal(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Hapus link ini?"
            okText="Hapus"
            cancelText="Batal"
            onConfirm={() => handleDeleteLink(record.key)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isCheckingAuth) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" description="Memeriksa sesi..." />
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard Admin</h1>

            <p className={styles.subtitle}>
              {adminUser ? (
                <>Selamat datang, <b>{adminUser.username}</b></>
              ) : (
                "Silakan login terlebih dahulu untuk mengelola portal"
              )}
            </p>
          </div>

          {adminUser && (
            <Space>
              {activeTab === "users" ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenUserModal(null)}
                >
                  Tambah Akun
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenLinkModal(null)}
                >
                  Tambah Link
                </Button>
              )}

              <Popconfirm
                title="Keluar dari sistem?"
                okText="Ya, Logout"
                cancelText="Batal"
                onConfirm={handleLogout}
              >
                <Button danger icon={<LogoutOutlined />}>
                  Logout
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>

        {adminUser ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "users",
                label: (
                  <span>
                    <TeamOutlined /> Kelola Akun
                  </span>
                ),
                children: (
                  <>
                    <div className={styles.toolbar}>
                      <Input.Search
                        placeholder="Cari username..."
                        allowClear
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                      />
                    </div>

                    <Table
                      columns={userColumns}
                      dataSource={filteredUsers}
                      rowKey="key"
                      pagination={{ pageSize: 5 }}
                    />
                  </>
                ),
              },
              {
                key: "links",
                label: (
                  <span>
                    <LinkOutlined /> Kelola Link
                  </span>
                ),
                children: (
                  <>
                    <div className={styles.toolbar}>
                      <Input.Search
                        placeholder="Cari judul link..."
                        allowClear
                        value={searchLink}
                        onChange={(e) => setSearchLink(e.target.value)}
                      />
                    </div>

                    <Table
                      columns={linkColumns}
                      dataSource={filteredLinks}
                      rowKey="key"
                      pagination={{ pageSize: 5 }}
                    />
                  </>
                ),
              },
            ]}
          />
        ) : (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              onClick={() => setIsLoginModalOpen(true)}
            >
              Klik untuk Login Admin
            </Button>
          </div>
        )}
      </Card>

      {/* Modal CRUD User */}
      <Modal
        title={selectedUser ? "Edit Akun Pengguna" : "Tambah Akun Pengguna Baru"}
        open={openUserModal}
        onOk={handleSaveUser}
        onCancel={() => {
          setOpenUserModal(false);
          setSelectedUser(null);
        }}
        okText="Simpan"
        cancelText="Batal"
        destroyOnHidden
        preserve={false}
      >
        <Form
          key={selectedUser ? selectedUser.key : "create-user"}
          form={userForm}
          layout="vertical"
          preserve={false}
          initialValues={
            selectedUser
              ? { username: selectedUser.username, role: selectedUser.role || "User", password: "" }
              : { role: "User", username: "", password: "" }
          }
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Masukkan username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: !selectedUser,
                message: "Masukkan password!",
              },
            ]}
          >
            <Input.Password
              placeholder={
                selectedUser
                  ? "Kosongkan jika tidak ingin mengubah password"
                  : "Password"
              }
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Pilih role!" }]}
          >
            <Input placeholder="Admin / User" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal CRUD Link */}
      <Modal
        title={selectedLink ? "Edit Link" : "Tambah Link Baru"}
        open={openLinkModal}
        onOk={handleSaveLink}
        onCancel={() => {
          setOpenLinkModal(false);
          setSelectedLink(null);
        }}
        okText="Simpan"
        cancelText="Batal"
        destroyOnHidden
        preserve={false}
      >
        <Form
          key={selectedLink ? selectedLink.key : "create-link"}
          form={linkForm}
          layout="vertical"
          preserve={false}
          initialValues={
            selectedLink
              ? { title: selectedLink.title, url: selectedLink.url, icon: selectedLink.icon }
              : { title: "", url: "", icon: "" }
          }
        >
          <Form.Item
            label="Judul Form / Link"
            name="title"
            rules={[{ required: true, message: "Masukkan judul link!" }]}
          >
            <Input placeholder="Contoh: Claim Dinas Luar Kota" />
          </Form.Item>

          <Form.Item
            label="URL Form / Google Form"
            name="url"
            rules={[
              { required: true, message: "Masukkan URL link!" },
              { type: "url", message: "Masukkan URL yang valid!" },
            ]}
          >
            <Input placeholder="https://forms.gle/..." />
          </Form.Item>

          <Form.Item
            label="Icon (Emoji)"
            name="icon"
            rules={[{ required: true, message: "Masukkan emoji icon!" }]}
          >
            <Input placeholder="Contoh: 🚌" style={{ width: "120px" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Auth Login Admin */}
      <Modal
        title="Login Admin Required"
        open={isLoginModalOpen}
        closable={false}
        mask={{ closable: false }}
        footer={null}
        centered
      >
        <Form form={loginForm} layout="vertical" onFinish={handleLoginSubmit}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Masukkan username admin!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Masukkan password!" }]}
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