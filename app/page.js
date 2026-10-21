"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Form, Input, Button, message, Tag, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  LockFilled,
  ClockCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  DownOutlined,
  GlobalOutlined,
  MailOutlined,
  WhatsAppOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./page.module.css";

const SESSION_KEY = "userSession";
const SESSION_TIMEOUT = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
const MAX_STAGGER = 12;
const INFO_PREVIEW_COUNT = 6;
const DEFAULT_PROGRESS = "Belum Dikerjakan";

const PROGRESS_META = {
  "Belum Dikerjakan": { tone: styles.toneTodo, step: 1, icon: <ClockCircleOutlined /> },
  "Dalam Pengerjaan": { tone: styles.toneProgress, step: 2, icon: <SyncOutlined /> },
  Selesai: { tone: styles.toneDone, step: 3, icon: <CheckCircleOutlined /> },
};

const CONTACTS = [
  {
    key: "website",
    label: "Website",
    value: "ctu-indonesia.com",
    href: "https://ctu-indonesia.com/",
    icon: <GlobalOutlined />,
  },
  {
    key: "email",
    label: "Email",
    value: "teknik@ctu-indonesia.com",
    href: "mailto:teknik@ctu-indonesia.com",
    icon: <MailOutlined />,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: "+62 895-0578-8887",
    href: "https://wa.me/6289505788887",
    icon: <WhatsAppOutlined />,
  }
];

const INFO_TILES = [
  { key: "Semua", tone: styles.toneAll, icon: <AppstoreOutlined /> },
  ...Object.entries(PROGRESS_META).map(([key, meta]) => ({
    key,
    tone: meta.tone,
    icon: meta.icon,
  })),
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLinkName = (link) => link.name || link.title || "Link";

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export default function Home() {
  const router = useRouter();
  const [loginForm] = Form.useForm();

  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const [links, setLinks] = useState([]);
  const [linksStatus, setLinksStatus] = useState("idle");
  const [linkSearch, setLinkSearch] = useState("");

  const [infos, setInfos] = useState([]);
  const [infosStatus, setInfosStatus] = useState("loading");
  const [infoFilter, setInfoFilter] = useState("Semua");
  const [showAllInfos, setShowAllInfos] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const endSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setLinks([]);
    setLinksStatus("idle");
    setLinkSearch("");
    setInfoOpen(false);
    setInfoFilter("Semua");
    setShowAllInfos(false);
    setIsLoginModalOpen(false);
  }, []);

  const fetchLinks = useCallback(async () => {
    setLinksStatus("loading");
    try {
      const snapshot = await getDocs(collection(db, "data_link"));
      setLinks(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setLinksStatus("done");
    } catch (error) {
      console.error(error);
      setLinksStatus("error");
      message.error("Gagal memuat daftar link");
    }
  }, []);

  const fetchInfos = useCallback(async () => {
    setInfosStatus("loading");
    try {
      const snapshot = await getDocs(collection(db, "data_information"));
      const list = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setInfos(list);
      setInfosStatus("done");
    } catch (error) {
      console.error(error);
      setInfosStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!isCheckingSession && !currentUser) fetchInfos();
  }, [isCheckingSession, currentUser, fetchInfos]);

  useEffect(() => {
    const clearOnUnload = () => localStorage.removeItem(SESSION_KEY);
    window.addEventListener("beforeunload", clearOnUnload);

    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation?.type === "reload") {
      localStorage.removeItem(SESSION_KEY);
    } else {
      const stored = readStoredSession();
      if (stored) setCurrentUser(stored);
    }
    setIsCheckingSession(false);

    return () => window.removeEventListener("beforeunload", clearOnUnload);
  }, []);

  useEffect(() => {
    if (currentUser) fetchLinks();
  }, [currentUser, fetchLinks]);

  useEffect(() => {
    if (!currentUser) return;

    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        endSession();
        message.warning("Session berakhir karena tidak aktif selama 5 menit.");
      }, SESSION_TIMEOUT);
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [currentUser, endSession]);

  const filteredLinks = useMemo(() => {
    const keyword = linkSearch.trim().toLowerCase();
    if (!keyword) return links;
    return links.filter((link) => getLinkName(link).toLowerCase().includes(keyword));
  }, [links, linkSearch]);

  const infoCounts = useMemo(
    () =>
      infos.reduce((counts, item) => {
        const key = item.progress || DEFAULT_PROGRESS;
        counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {}),
    [infos]
  );

  const filteredInfos = useMemo(() => {
    if (infoFilter === "Semua") return infos;
    return infos.filter((item) => (item.progress || DEFAULT_PROGRESS) === infoFilter);
  }, [infos, infoFilter]);

  const visibleInfos = showAllInfos
    ? filteredInfos
    : filteredInfos.slice(0, INFO_PREVIEW_COUNT);

  const handleInfoFilter = (filter) => {
    setInfoFilter(filter);
    setShowAllInfos(false);
  };

  const handleLoginSubmit = async (values) => {
    setLoginLoading(true);
    try {
      const username = values.username.trim().toLowerCase();
      const snapshot = await getDocs(collection(db, "users"));
      const matched = snapshot.docs
        .map((item) => item.data())
        .find(
          (user) =>
            user.username?.trim().toLowerCase() === username &&
            user.password === values.password
        );

      if (!matched) {
        message.error("Username atau password salah!");
        return;
      }

      const { password: _password, ...safeUser } = matched;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      setCurrentUser(safeUser);
      setIsLoginModalOpen(false);
      loginForm.resetFields();
      message.success(`Selamat datang, ${safeUser.username}!`);
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    endSession();
    message.success("Berhasil logout");
  };

  const renderLinks = () => {
    if (linksStatus === "idle" || linksStatus === "loading") {
      return (
        <div className={styles.state}>
          <Spin size="large" description="Memuat daftar link..." />
        </div>
      );
    }

    if (linksStatus === "error") {
      return (
        <div className={styles.state}>
          <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
            <ExclamationCircleOutlined />
          </div>
          <h3 className={styles.stateTitle}>Gagal memuat link</h3>
          <p className={styles.stateText}>Periksa koneksi Anda lalu coba lagi.</p>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            className={styles.stateButton}
            onClick={fetchLinks}
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (links.length === 0) {
      return (
        <div className={styles.state}>
          <div className={styles.stateIcon}>
            <InboxOutlined />
          </div>
          <h3 className={styles.stateTitle}>Belum ada link</h3>
          <p className={styles.stateText}>
            Silakan tambahkan link melalui dashboard admin.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className={styles.sectionBar}>
          <div className={styles.sectionTitle}>
            Daftar Link
            <span className={styles.countBadge}>{filteredLinks.length}</span>
          </div>
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="Cari link..."
            value={linkSearch}
            onChange={(event) => setLinkSearch(event.target.value)}
            className={styles.searchInput}
          />
        </div>

        {filteredLinks.length > 0 ? (
          <div className={styles.links}>
            {filteredLinks.map((link, index) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
                style={{ "--i": Math.min(index, MAX_STAGGER) }}
              >
                <div className={styles.cardImage}>
                  {link.image ? (
                    <img
                      src={link.image}
                      alt={getLinkName(link)}
                      loading="lazy"
                      className={styles.cardImg}
                    />
                  ) : (
                    <span className={styles.cardIcon}>🔗</span>
                  )}
                </div>
                <div className={styles.cardTitle}>{getLinkName(link)}</div>
              </a>
            ))}
          </div>
        ) : (
          <div className={styles.state}>
            <div className={styles.stateIcon}>
              <SearchOutlined />
            </div>
            <h3 className={styles.stateTitle}>Link tidak ditemukan</h3>
            <p className={styles.stateText}>Coba gunakan kata kunci yang lain.</p>
          </div>
        )}
      </>
    );
  };

  const renderInfos = () => {
    if (infosStatus === "loading") {
      return (
        <div className={styles.state}>
          <Spin size="large" description="Memuat informasi..." />
        </div>
      );
    }

    if (infosStatus === "error") {
      return (
        <div className={styles.state}>
          <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
            <ExclamationCircleOutlined />
          </div>
          <h3 className={styles.stateTitle}>Gagal memuat informasi</h3>
          <p className={styles.stateText}>Periksa koneksi Anda lalu coba lagi.</p>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            className={styles.stateButton}
            onClick={fetchInfos}
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (infos.length === 0) return null;

    const doneCount = infoCounts.Selesai || 0;
    const donePercent = Math.round((doneCount / infos.length) * 100);

    return (
      <section className={styles.infoSection}>
        <div className={styles.infoHeader}>
          <h2 className={styles.infoHeadingWrap}>
            <button
              type="button"
              className={styles.infoToggle}
              aria-expanded={infoOpen}
              aria-controls="info-content"
              onClick={() => setInfoOpen((current) => !current)}
            >
              <span className={styles.infoHeadingIcon}>
                <InfoCircleOutlined />
              </span>
              <span className={styles.infoHeadingText}>
                <span className={styles.infoTitle}>Informasi dan Progress</span>
                <span className={styles.infoSubtitle}>
                  {infoOpen
                    ? "Pantau perkembangan terbaru secara transparan."
                    : "Klik untuk menampilkan detail informasi."}
                </span>
              </span>
              <span className={`${styles.chevron} ${infoOpen ? styles.chevronOpen : ""}`}>
                <DownOutlined />
              </span>
            </button>
          </h2>

          <div className={styles.overall}>
            <div className={styles.overallTop}>
              <span>Penyelesaian</span>
              <strong>{donePercent}%</strong>
            </div>
            <div className={styles.overallBar}>
              <span className={styles.overallFill} style={{ width: `${donePercent}%` }} />
            </div>
            <div className={styles.overallNote}>
              {doneCount} dari {infos.length} informasi selesai
            </div>
          </div>
        </div>

        <div
          id="info-content"
          className={`${styles.collapse} ${infoOpen ? styles.collapseOpen : ""}`}
        >
          <div className={styles.collapseInner}>
            <div className={styles.tiles}>
              {INFO_TILES.map((tile) => {
                const count = tile.key === "Semua" ? infos.length : infoCounts[tile.key] || 0;
                const active = infoFilter === tile.key;
                return (
                  <button
                    key={tile.key}
                    type="button"
                    aria-pressed={active}
                    className={`${styles.tile} ${tile.tone} ${active ? styles.tileActive : ""}`}
                    onClick={() => handleInfoFilter(tile.key)}
                  >
                    <span className={styles.tileIcon}>{tile.icon}</span>
                    <span className={styles.tileText}>
                      <span className={styles.tileCount}>{count}</span>
                      <span className={styles.tileLabel}>{tile.key}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {visibleInfos.length > 0 ? (
              <div className={styles.infoGrid}>
                {visibleInfos.map((info, index) => {
                  const progress = PROGRESS_META[info.progress] ? info.progress : DEFAULT_PROGRESS;
                  const meta = PROGRESS_META[progress];
                  return (
                    <article
                      key={info.id}
                      className={`${styles.infoCard} ${meta.tone}`}
                      style={{ "--i": Math.min(index, MAX_STAGGER) }}
                    >
                      <div className={styles.infoMeta}>
                        <span className={styles.statusTag}>
                          <span className={styles.dot} />
                          {progress}
                        </span>
                      </div>

                      <h3 className={styles.infoName}>{info.name || "Tanpa nama"}</h3>
                      <p className={styles.infoDesc}>
                        {info.description || "Tidak ada deskripsi."}
                      </p>

                      <div className={styles.infoFooter}>
                        <span className={styles.infoDate}>
                          <CalendarOutlined /> {formatDate(info.date)}
                        </span>
                        <div
                          className={styles.track}
                          role="img"
                          aria-label={`Tahap ${meta.step} dari 3`}
                        >
                          {[1, 2, 3].map((step) => (
                            <span
                              key={step}
                              className={`${styles.trackSeg} ${
                                step <= meta.step ? styles.trackSegOn : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.state}>
                <div className={styles.stateIcon}>
                  <InboxOutlined />
                </div>
                <h3 className={styles.stateTitle}>Belum ada informasi</h3>
                <p className={styles.stateText}>Tidak ada informasi dengan status ini.</p>
              </div>
            )}

            {filteredInfos.length > INFO_PREVIEW_COUNT && (
              <div className={styles.moreWrap}>
                <Button
                  className={styles.moreButton}
                  onClick={() => setShowAllInfos((current) => !current)}
                >
                  {showAllInfos
                    ? "Tampilkan lebih sedikit"
                    : `Lihat semua (${filteredInfos.length})`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
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
          <a
            href="https://ctu-indonesia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.logo}
          >
            <img src="/Logo-CTU.png" alt="Logo CTU" className={styles.logoImg} />
          </a>

          <div className={styles.userActionArea}>
            {currentUser && (
              <>
                <Tag
                  color={currentUser.role === "Admin" ? "blue" : "green"}
                  className={styles.userTag}
                >
                  {currentUser.username} ({currentUser.role})
                </Tag>

                <div className={styles.actions}>
                  {currentUser.role === "Admin" && (
                    <Button
                      type="primary"
                      icon={<DashboardOutlined />}
                      className={`${styles.actionButton} ${styles.dashboardButton}`}
                      onClick={() => router.push("/dashboard")}
                    >
                      Dashboard
                    </Button>
                  )}

                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    className={`${styles.actionButton} ${styles.logoutButton}`}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <h1 className={styles.header}>CTU PORTAL</h1>

        <div className={styles.content}>
          {currentUser ? (
            renderLinks()
          ) : (
            <>
              {renderInfos()}
              <div className={styles.lockedContainer}>
                <div className={styles.lockedIconWrap}>
                  <LockFilled className={styles.lockedIcon} />
                </div>

                <h2 className={styles.lockedTitle}>Akses terkunci</h2>
                <p className={styles.lockedText}>
                  Masuk dengan akun Anda untuk membuka daftar link portal CTU.
                </p>

                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  className={styles.lockedButton}
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Masuk Sekarang
                </Button>

                <p className={styles.lockedNote}>
                  Sesi berakhir otomatis setelah 5 menit tidak aktif.
                </p>
              </div>
            </>
          )}
        </div>

        <footer className={styles.contact}>
          <div className={styles.contactHeader}>
            <h2 className={styles.contactTitle}>Contact</h2>
            <p className={styles.contactSubtitle}>
              Ada pertanyaan? Hubungi kami melalui kontak berikut.
            </p>
          </div>

          <div className={styles.contactGrid}>
            {CONTACTS.map((contact) => {
              const content = (
                <>
                  <span className={styles.contactIcon}>{contact.icon}</span>
                  <span className={styles.contactText}>
                    <span className={styles.contactLabel}>{contact.label}</span>
                    <span className={styles.contactValue}>{contact.value}</span>
                  </span>
                </>
              );

              return contact.href ? (
                <a
                  key={contact.key}
                  href={contact.href}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`${styles.contactItem} ${styles.contactLink}`}
                >
                  {content}
                </a>
              ) : (
                <div key={contact.key} className={styles.contactItem}>
                  {content}
                </div>
              );
            })}
          </div>

          <p className={styles.copyright}>
            © {new Date().getFullYear()} CTU Indonesia. All rights reserved.
          </p>
        </footer>
      </div>

      <Modal
        open={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
        afterClose={() => {
          loginForm.resetFields();
          setCapsOn(false);
        }}
        footer={null}
        title={null}
        closable
        keyboard
        mask={{ closable: true }}
        centered
        width="min(400px, calc(100vw - 32px))"
        rootClassName={styles.modalRoot}
      >
        <div className={styles.loginPanel}>
          <div className={styles.loginIcon}>
            <LoginOutlined />
          </div>

          <h2 className={styles.loginTitle}>Masuk ke CTU Portal</h2>
          <p className={styles.loginSubtitle}>
            Gunakan akun Anda untuk membuka daftar link.
          </p>

          <Form
            form={loginForm}
            layout="vertical"
            onFinish={handleLoginSubmit}
            requiredMark={false}
            className={styles.loginForm}
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
                className={styles.loginInput}
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
                className={styles.loginInput}
                onKeyUp={(event) => setCapsOn(!!event.getModifierState?.("CapsLock"))}
                onBlur={() => setCapsOn(false)}
              />
            </Form.Item>

            {capsOn && (
              <p className={styles.loginCaps} role="alert">
                <WarningOutlined /> Caps Lock sedang aktif.
              </p>
            )}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loginLoading}
              icon={<LoginOutlined />}
              className={styles.loginSubmit}
            >
              Masuk
            </Button>
          </Form>

          <p className={styles.loginNote}>
            <ClockCircleOutlined /> Sesi berakhir otomatis setelah 5 menit tidak aktif.
          </p>
        </div>
      </Modal>
    </main>
  );
}