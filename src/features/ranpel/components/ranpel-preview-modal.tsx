"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Box,
  Title,
  Paper,
  Badge,
  Timeline,
  Textarea,
  Avatar,
  Divider,
  ActionIcon,
  Tooltip,
  ThemeIcon,
} from "@mantine/core";
import {
  IconDownload,
  IconCircleCheck,
  IconClock,
  IconSignature,
  IconUserExclamation,
  IconFileText,
  IconMessage2,
  IconPlus,
  IconSchool,
  IconId,
  IconChevronRight,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { apiClient } from "@/lib/api-client";

interface RanpelPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  pengajuan: PengajuanRancanganPenelitian | null;
  studentName?: string;
  studentNim?: string;
  isDosenPa?: boolean;
  onComment?: (field: string, value: string) => void;
}

export function RanpelPreviewModal({
  opened,
  onClose,
  pengajuan,
  studentName,
  studentNim,
  isDosenPa,
  onComment,
}: RanpelPreviewModalProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingSurat, setDownloadingSurat] = useState(false);
  const { userResponse } = useAuth();

  const user = userResponse?.user;
  const rawRoles = user?.roles || userResponse?.roles || [];
  const roles = Array.isArray(rawRoles) ? rawRoles.map(String) : [];
  const isMahasiswa = roles.includes("mahasiswa");

  if (!pengajuan || !pengajuan.rancanganPenelitian) return null;

  const data = pengajuan.rancanganPenelitian;

  const handleAddComment = (field: string, label: string, currentVal: string) => {
    let newVal = currentVal || "";
    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconMessage2 size={20} className="text-gs-primary" />
          <Text fw={700}>Tambah Komentar: {label}</Text>
        </Group>
      ),
      children: (
        <Stack gap="sm" py="md">
          <Text size="sm" c="dimmed">
            Berikan masukan atau revisi spesifik untuk bagian ini. Mahasiswa akan melihat komentar ini pada dashboard mereka.
          </Text>
          <Textarea
            placeholder="Tulis masukan/revisi..."
            defaultValue={currentVal}
            onChange={(e) => (newVal = e.target.value)}
            minRows={4}
            autosize
            radius="md"
          />
        </Stack>
      ),
      labels: { confirm: "Simpan Komentar", cancel: "Batal" },
      confirmProps: { className: "bg-gs-primary hover:bg-gs-primary-hover", radius: "md" },
      cancelProps: { radius: "md" },
      onConfirm: () => onComment?.(field, newVal),
    });
  };

  const handleDownloadPdf = async () => {
    if (!pengajuan) return;
    try {
      setDownloadingPdf(true);
      const response = await apiClient.get(`/ranpel/export-pdf/${pengajuan.id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `RANPEL_${studentNim || "DOCUMENT"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadSuratJudul = async () => {
    if (!pengajuan) return;
    try {
      setDownloadingSurat(true);
      const response = await apiClient.get(`/ranpel/export-surat-judul/${pengajuan.id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SURAT_PENGAJUAN_JUDUL_${studentNim || "DOCUMENT"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setDownloadingSurat(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "diterima": return "var(--gs-success)";
      case "ditolak": return "var(--gs-danger)";
      case "menunggu": return "var(--gs-warning)";
      case "diverifikasi": return "var(--gs-primary)";
      default: return "var(--gs-border-strong)";
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="95%"
      padding={0}
      withCloseButton={true}
      title={
        <Group gap="xs">
          <ThemeIcon variant="light" className="bg-gs-bg-overlay text-gs-primary" size="lg" radius="md">
            <IconFileText size={20} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={800} size="md" className="tracking-tight uppercase">Detail Rancangan Penelitian</Text>
            <Text size="xs" c="dimmed" fw={600}>ID Pengajuan: #{pengajuan.id}</Text>
          </Stack>
        </Group>
      }
      styles={{
        header: {
          padding: "16px 24px",
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "white",
        },
        body: {
          padding: 0,
          backgroundColor: "#fcfcfd",
          height: "calc(90vh - 70px)",
        },
        content: {
          height: "90vh",
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <div className="flex h-full w-full">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          <Stack gap={40}>
            {/* Elegant Header Section */}
            <div className="relative">
              <div className="absolute -left-10 top-0 bottom-0 w-1 bg-gs-primary rounded-full" />
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} className="flex-1">
                    <Text size="sm" fw={800} className="text-gs-primary" tt="uppercase" lts={1}>Informasi Penelitian</Text>
                    <Title order={1} className="gs-page-title text-slate-900">
                      {data.judulPenelitian}
                    </Title>
                  </Stack>
                  <Badge size="xl" radius="md" variant="filled" style={{ backgroundColor: getStatusColor(pengajuan.statusKaprodi) }}>
                    {pengajuan.statusKaprodi.toUpperCase()}
                  </Badge>
                </Group>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Paper withBorder radius="md" p="md" className="bg-white shadow-sm border-gs-border">
                    <Group gap="md" wrap="nowrap">
                      <Avatar size="lg" radius="md" className="bg-gs-bg-overlay text-gs-primary" src={null}>
                        {studentName?.charAt(0)}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>Mahasiswa</Text>
                        <Text fw={700} size="sm" className="text-gs-text-primary">{studentName}</Text>
                        <Text size="xs" className="text-gs-primary" fw={700}>{studentNim}</Text>
                      </Stack>
                    </Group>
                  </Paper>

                  <Paper withBorder radius="md" p="md" className="bg-white shadow-sm border-gs-border">
                    <Stack gap={4}>
                      <Group gap={6}>
                        <IconSchool size={14} className="text-gs-primary" />
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>Program Studi</Text>
                      </Group>
                      <Text fw={700} size="sm" className="text-gs-text-primary">{pengajuan.mahasiswa?.prodi?.namaProdi || "-"}</Text>
                    </Stack>
                  </Paper>

                  <Paper withBorder radius="md" p="md" className="bg-white shadow-sm border-gs-border">
                    <Stack gap={4}>
                      <Group gap={6}>
                        <IconId size={14} className="text-gs-primary" />
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>Angkatan</Text>
                      </Group>
                      <Text fw={700} size="sm" className="text-gs-text-primary">{pengajuan.mahasiswa?.angkatan || "-"}</Text>
                    </Stack>
                  </Paper>
                </div>
              </Stack>
            </div>

            {/* Research Sections */}
            <Stack gap="xl">
              {[
                { id: "masalah", field: "komen_pa_masalah", label: "Masalah dan Penyebab", content: data.masalahDanPenyebab, commentPa: pengajuan?.komenPaMasalah, commentKpr: pengajuan?.komenKprMasalah },
                { id: "solusi", field: "komen_pa_solusi", label: "Alternatif Solusi", content: data.alternatifSolusi, commentPa: pengajuan?.komenPaSolusi, commentKpr: pengajuan?.komenKprSolusi },
                { id: "hasil", field: "komen_pa_hasil", label: "Hasil yang diharapkan", content: data.hasilYangDiharapkan, commentPa: pengajuan?.komenPaHasil, commentKpr: pengajuan?.komenKprHasil },
                { id: "data", field: "komen_pa_data", label: "Kebutuhan Data", content: data.kebutuhanData, commentPa: pengajuan?.komenPaData, commentKpr: pengajuan?.komenKprData },
                { id: "metode", field: "komen_pa_metode", label: "Metode Pelaksanaan", content: data.metodePenelitian, commentPa: pengajuan?.komenPaMetode, commentKpr: pengajuan?.komenKprMetode },
                { id: "jurnal", field: "", label: "Referensi & Lampiran", content: data.jurnalReferensi, commentPa: null, commentKpr: null },
              ].map((section, idx) => (
                <div key={section.id} className="group">
                  <Group justify="space-between" mb="md">
                    <Group gap="sm">
                      <ThemeIcon variant="light" color="slate" size="md" radius="md" className="bg-slate-200">
                        <Text fw={800} size="xs" c="slate.8">{idx + 1}</Text>
                      </ThemeIcon>
                      <Title order={3} className="text-slate-800" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                        {section.label}
                      </Title>
                    </Group>
                    
                    {isDosenPa && section.field && pengajuan.statusDosenPa === 'menunggu' && (
                      <Button 
                        variant="subtle" 
                        className="text-gs-primary hover:bg-gs-bg-hover"
                        size="xs" 
                        radius="md"
                        fw={700}
                        leftSection={<IconPlus size={16} stroke={2} />}
                        onClick={() => handleAddComment(section.field, section.label, section.commentPa || "")}
                      >
                        TAMBAH KOMENTAR
                      </Button>
                    )}
                  </Group>

                  <Paper withBorder radius="md" p="xl" className="bg-white shadow-sm border-gs-border">
                    <div className="prose prose-slate max-w-none">
                      {section.content?.startsWith("<") ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: section.content || "" }}
                          className="text-gs-text-primary leading-relaxed text-[14px]"
                        />
                      ) : (
                        <Text className="text-gs-text-primary whitespace-pre-wrap leading-relaxed text-[14px]" fw={500}>
                          {section.content || "Mahasiswa belum mengisi bagian ini."}
                        </Text>
                      )}
                    </div>

                    {/* Section Review Thread */}
                    {(section.commentPa || section.commentKpr) && (
                      <Stack gap="md" mt={25} className="bg-gs-bg-base p-6 rounded-md border border-dashed border-gs-border-strong">
                        <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts={1}>Review History</Text>
                        {section.commentPa && (
                          <Group align="flex-start" wrap="nowrap" gap="md">
                            <ThemeIcon className="bg-gs-bg-overlay text-gs-primary" variant="light" size="sm" radius="md"><IconSignature size={12} /></ThemeIcon>
                            <Stack gap={4}>
                              <Text size="xs" fw={800} className="text-gs-primary">DOSEN PEMBIMBING AKADEMIK (PA)</Text>
                              <Text size="sm" className="text-gs-text-secondary italic leading-relaxed">&quot;{section.commentPa}&quot;</Text>
                            </Stack>
                          </Group>
                        )}
                        {section.commentKpr && (
                          <Group align="flex-start" wrap="nowrap" gap="md">
                            <ThemeIcon className="bg-gs-bg-overlay text-gs-success-text" variant="light" size="sm" radius="md"><IconSignature size={12} /></ThemeIcon>
                            <Stack gap={4}>
                              <Text size="xs" fw={800} className="text-gs-success-text">KETUA PROGRAM STUDI</Text>
                              <Text size="sm" className="text-gs-text-secondary italic leading-relaxed">&quot;{section.commentKpr}&quot;</Text>
                            </Stack>
                          </Group>
                        )}
                      </Stack>
                    )}
                  </Paper>
                </div>
              ))}
            </Stack>
            <Box h={40} />
          </Stack>
        </div>

        {/* Action Sidebar */}
        <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          <Stack p={30} gap={35}>
            {/* Workflow Progress */}
            <div>
              <Group mb={25} justify="space-between">
                <Title order={4} fw={800} className="text-gs-text-primary tracking-tight">Status Workflow</Title>
                <ActionIcon variant="light" className="bg-gs-bg-overlay text-gs-primary" radius="md"><IconSignature size={18} /></ActionIcon>
              </Group>

              <Timeline
                active={pengajuan.statusKaprodi === 'diterima' ? 2 : (pengajuan.statusDosenPa === 'diverifikasi' ? 1 : 0)}
                bulletSize={24}
                lineWidth={2}
                color="var(--gs-primary)"
                styles={{
                  itemTitle: { fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: 4 },
                  itemContent: { paddingLeft: 12 }
                }}
              >
                <Timeline.Item
                  bullet={<IconFileText size={14} />}
                  title="Draft Pengajuan"
                >
                  <Text size="xs" c="dimmed" fw={700}>Submitted on:</Text>
                  <Text size="xs" fw={800}>
                    {new Date(pengajuan.tanggalPengajuan).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  bullet={<IconCircleCheck size={14} />}
                  title="Verifikasi Dosen PA"
                >
                  {pengajuan.tanggalReviewPa ? (
                    <Stack gap={2}>
                      <Text size="xs" className="text-gs-success-text" fw={800}>VERIFIED</Text>
                      <Text size="xs" c="dimmed" fw={700}>
                        {new Date(pengajuan.tanggalReviewPa).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </Text>
                      <Text size="xs" fs="italic" c="dimmed" fw={600}>{pengajuan.mahasiswa?.dosenPa?.nama}</Text>
                    </Stack>
                  ) : (
                    <Badge variant="light" color="var(--gs-warning)" size="xs" radius="sm" fw={700}>WAITING REVIEW</Badge>
                  )}
                </Timeline.Item>

                <Timeline.Item
                  bullet={<IconUserExclamation size={14} />}
                  title="Keputusan Kaprodi"
                >
                  {pengajuan.tanggalReviewKaprodi ? (
                    <Stack gap={2}>
                      <Text size="xs" className="text-gs-primary" fw={800}>FINALIZED</Text>
                      <Text size="xs" c="dimmed" fw={700}>
                        {new Date(pengajuan.tanggalReviewKaprodi).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </Text>
                    </Stack>
                  ) : (
                    <Badge variant="dot" color="var(--gs-primary)" size="xs" radius="sm" fw={700}>QUEUEING</Badge>
                  )}
                </Timeline.Item>
              </Timeline>
            </div>

            {/* Overall Decision Note */}
            {(pengajuan.catatanDosenPa || pengajuan.catatanKaprodi) && (
              <Stack gap="lg">
                <Title order={5} fw={700} className="text-slate-800">Catatan Akhir</Title>
                {pengajuan.catatanDosenPa && (
                  <Paper withBorder radius="md" p="md" className="bg-gs-bg-base border-gs-border">
                    <Group gap={8} mb={8}>
                      <IconSignature size={14} className="text-gs-primary" />
                      <Text size="xs" fw={800} className="text-gs-primary">CATATAN PA</Text>
                    </Group>
                    <Text size="sm" className="italic font-medium text-gs-text-primary leading-relaxed">
                      &quot;{pengajuan.catatanDosenPa}&quot;
                    </Text>
                  </Paper>
                )}
                {pengajuan.catatanKaprodi && (
                  <Paper withBorder radius="md" p="md" className="bg-gs-bg-overlay border-gs-border">
                    <Group gap={8} mb={8}>
                      <IconSignature size={14} className="text-gs-success-text" />
                      <Text size="xs" fw={800} className="text-gs-success-text">CATATAN KAPRODI</Text>
                    </Group>
                    <Text size="sm" className="italic font-medium text-gs-text-primary leading-relaxed">
                      &quot;{pengajuan.catatanKaprodi}&quot;
                    </Text>
                  </Paper>
                )}
              </Stack>
            )}

            {/* Quick Actions */}
            {isMahasiswa && (
              <Stack gap="md" mt="auto">
                <Button
                  onClick={handleDownloadPdf}
                  fullWidth
                  size="md"
                  className="bg-gs-primary hover:bg-gs-primary-hover"
                  radius="md"
                  loading={downloadingPdf}
                  fw={700}
                  leftSection={<IconDownload size={20} stroke={2} />}
                >
                  EXPORT LAPORAN (PDF)
                </Button>

                {pengajuan.statusKaprodi === "diterima" && (
                  <Button
                    onClick={handleDownloadSuratJudul}
                    fullWidth
                    size="md"
                    variant="light"
                    className="text-gs-success-text bg-gs-bg-overlay border-gs-border"
                    radius="md"
                    loading={downloadingSurat}
                    fw={700}
                    leftSection={<IconDownload size={18} stroke={2} />}
                  >
                    SURAT PENGAJUAN JUDUL
                  </Button>
                )}
              </Stack>
            )}

          </Stack>
        </div>
      </div>
    </Modal>
  );
}
