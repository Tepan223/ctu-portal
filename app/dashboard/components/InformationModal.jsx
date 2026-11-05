
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

const PROGRESS_OPTIONS = [
  DEFAULT_PROGRESS,
  "Dalam Pengerjaan",
  "Selesai",
].map((item) => ({
  label: item,
  value: item,
}));

const parseDate = (value) => {
  if (!value) return null;

  const date =
    typeof value?.toDate === "function"
      ? dayjs(value.toDate())
      : dayjs(value);

  return date.isValid() ? date : null;
};

const getInitialValues = (selectedInfo) => ({
  name: selectedInfo?.name ?? "",
  description: selectedInfo?.description ?? "",
  startDate: parseDate(
    selectedInfo?.startDate || selectedInfo?.date
  ),
  endDate: parseDate(
    selectedInfo?.endDate || selectedInfo?.date
  ),
  progress: selectedInfo?.progress ?? DEFAULT_PROGRESS,
});

export default function InformationModal({
  open,
  selectedInfo,
  onSave,
  onCancel,
  loading,
}) {
  const [form] = Form.useForm();
  const isEdit = !!selectedInfo;

  const initialValues = getInitialValues(selectedInfo);

  const handleSubmit = (values) => {
    onSave(values);
  };

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
              {isEdit ? "Edit Project" : "Tambah Project"}
            </h2>

            <p className={styles.subtitle}>
              {isEdit
                ? "Ubah project yang sudah tersimpan."
                : "Catat project dan progress pengerjaan baru."}
            </p>
          </div>
        </div>

        <Form
          key={selectedInfo?.id || "new-project"}
          form={form}
          layout="vertical"
          preserve={false}
          requiredMark={false}
          initialValues={initialValues}
          onFinish={handleSubmit}
          className={styles.form}
        >
          <Form.Item
            label="Nama Project"
            name="name"
            rules={[
              {
                required: true,
                message: "Nama wajib diisi.",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<FileTextOutlined />}
              placeholder="Masukkan nama project"
              autoComplete="off"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder="Deskripsi (opsional)"
              className={styles.textarea}
            />
          </Form.Item>

          <Form.Item
            label="Tanggal Mulai"
            name="startDate"
            rules={[
              {
                required: true,
                message: "Tanggal mulai wajib diisi.",
              },
            ]}
          >
            <DatePicker
              size="large"
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal mulai"
              allowClear={false}
              className={styles.datePicker}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Tanggal Selesai"
            name="endDate"
            dependencies={["startDate"]}
            rules={[
              {
                required: true,
                message: "Tanggal selesai wajib diisi.",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("startDate");

                  if (
                    !value ||
                    !startDate ||
                    !value.isBefore(startDate, "day")
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      "Tanggal selesai tidak boleh sebelum tanggal mulai."
                    )
                  );
                },
              }),
            ]}
          >
            <DatePicker
              size="large"
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal selesai"
              allowClear={false}
              className={styles.datePicker}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Progress"
            name="progress"
            rules={[
              {
                required: true,
                message: "Progress wajib dipilih.",
              },
            ]}
          >
            <Select
              size="large"
              options={PROGRESS_OPTIONS}
              className={styles.select}
            />
          </Form.Item>

          <div className={styles.footer}>
            <Button
              size="large"
              className={styles.cancelButton}
              onClick={onCancel}
            >
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
