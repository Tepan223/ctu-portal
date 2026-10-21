"use client";

import dayjs from "dayjs";
import { Modal, Form, Input, Select, DatePicker, Button } from "antd";
import {
  FileTextOutlined,
  InfoCircleOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import styles from "./style/Informationmodal.module.css";

const DEFAULT_PROGRESS = "Belum Dikerjakan";

const PROGRESS_OPTIONS = [DEFAULT_PROGRESS, "Dalam Pengerjaan", "Selesai"].map((item) => ({
  label: item,
  value: item,
}));

export default function InformationModal({
  open,
  selectedInfo,
  onSave,
  onCancel,
  loading,
}) {
  const [form] = Form.useForm();
  const isEdit = !!selectedInfo;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={null}
      destroyOnHidden
      centered
      width="min(480px, calc(100vw - 32px))"
      rootClassName={styles.modalRoot}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            {isEdit ? <EditOutlined /> : <InfoCircleOutlined />}
          </div>
          <div>
            <h2 className={styles.title}>
              {isEdit ? "Edit Informasi" : "Tambah Informasi"}
            </h2>
            <p className={styles.subtitle}>
              {isEdit
                ? "Ubah informasi yang sudah tersimpan."
                : "Catat informasi dan progress pengerjaan baru."}
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          preserve={false}
          requiredMark={false}
          onFinish={onSave}
          initialValues={{
            name: selectedInfo?.name ?? "",
            description: selectedInfo?.description ?? "",
            date: selectedInfo?.date ? dayjs(selectedInfo.date) : dayjs(),
            progress: selectedInfo?.progress ?? DEFAULT_PROGRESS,
          }}
          className={styles.form}
        >
          <Form.Item
            label="Nama"
            name="name"
            rules={[{ required: true, message: "Nama wajib diisi." }]}
          >
            <Input
              size="large"
              prefix={<FileTextOutlined />}
              placeholder="Masukkan nama"
              autoComplete="off"
              autoFocus
              className={styles.input}
            />
          </Form.Item>

          <Form.Item label="Deskripsi" name="description">
            <Input.TextArea
              rows={4}
              placeholder="Deskripsi (opsional)"
              className={styles.textarea}
            />
          </Form.Item>

          <Form.Item
            label="Tanggal"
            name="date"
            rules={[{ required: true, message: "Tanggal wajib diisi." }]}
          >
            <DatePicker
              size="large"
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal"
              allowClear={false}
              className={styles.datePicker}
            />
          </Form.Item>

          <Form.Item
            label="Progress"
            name="progress"
            rules={[{ required: true, message: "Progress wajib dipilih." }]}
          >
            <Select size="large" options={PROGRESS_OPTIONS} className={styles.select} />
          </Form.Item>

          <div className={styles.footer}>
            <Button size="large" className={styles.cancelButton} onClick={onCancel}>
              Batal
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              className={styles.submitButton}
              onClick={() => form.submit()}
            >
              Simpan
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}