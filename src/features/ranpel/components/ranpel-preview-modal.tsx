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
  Typography,
  Paper,
  Badge,
  Timeline,
  Textarea,
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
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
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

  if (!pengajuan || !pengajuan.rancanganPenelitian) return null;

  const data = pengajuan.rancanganPenelitian;

  const handleAddComment = (field: string, label: string, currentVal: string) => {
    let newVal = currentVal || "";
    modals.openConfirmModal({
      title: `Tambah Komentar: ${label}`,
      children: (
        <Textarea
          placeholder="Tulis masukan/revisi..."
          defaultValue={currentVal}
          onChange={(e) => (newVal = e.target.value)}
          minRows={3}
          autosize
        />
      ),
      labels: { confirm: "Simpan", cancel: "Batal" },
      onConfirm: () => onComment?.(field, newVal),
    });
  };

  const handleDownloadPdf = async () => {
    if (!pengajuan) return;

    try {
      setDownloadingPdf(true);
      const response = await apiClient.get(
        `/ranpel/export-pdf/${pengajuan.id}`,
        {
          responseType: "blob",
        },
      );

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
      const response = await apiClient.get(
        `/ranpel/export-surat-judul/${pengajuan.id}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `SURAT_PENGAJUAN_JUDUL_${studentNim || "DOCUMENT"}.pdf`,
      );
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
      case "diterima":
        return "teal";
      case "ditolak":
        return "red";
      case "menunggu":
        return "orange";
      default:
        return "gray";
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
        <div className="flex items-center gap-2">
          <IconFileText size={20} className="text-indigo-600" />
          <Text fw={700} size="lg">
            Pratinjau Pengajuan Rancangan Penelitian
          </Text>
        </div>
      }
      styles={{
        header: {
          padding: "16px 24px",
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "white",
          zIndex: 10,
        },
        body: {
          padding: 0,
          backgroundColor: "#f8f9fa",
          overflow: "hidden",
          height: "calc(85vh - 70px)",
        },
        content: {
          height: "85vh",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        },
      }}
    >
      <div className="flex h-full w-full overflow-hidden">
        {/* Main Content - Modern System Design */}
        <div className="grow h-full overflow-y-auto bg-gray-50 flex flex-col p-8 space-y-6">
          
          {/* Header Info Card */}
          <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Stack gap="xs">
              <Badge color="indigo" variant="light" size="lg" radius="sm">Rancangan Penelitian</Badge>
              <Title order={2} className="text-gray-800 leading-tight">
                {data.judulPenelitian}
              </Title>
              <Group gap="xl" mt="sm">
                <Stack gap={0}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Mahasiswa</Text>
                  <Text fw={600}>{studentName} ({studentNim})</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Prodi</Text>
                  <Text fw={600}>{pengajuan.mahasiswa?.prodi?.namaProdi || "-"}</Text>
                </Stack>
              </Group>
            </Stack>
          </Paper>

          {/* Research Content Sections */}
          {[
            { id: "masalah", field: "komen_pa_masalah", label: "Masalah dan Penyebab", content: data.masalahDanPenyebab, commentPa: pengajuan?.komenPaMasalah, commentKpr: pengajuan?.komenKprMasalah },
            { id: "solusi", field: "komen_pa_solusi", label: "Alternatif Solusi", content: data.alternatifSolusi, commentPa: pengajuan?.komenPaSolusi, commentKpr: pengajuan?.komenKprSolusi },
            { id: "hasil", field: "komen_pa_hasil", label: "Hasil yang diharapkan", content: data.hasilYangDiharapkan, commentPa: pengajuan?.komenPaHasil, commentKpr: pengajuan?.komenKprHasil },
            { id: "data", field: "komen_pa_data", label: "Kebutuhan Data", content: data.kebutuhanData, commentPa: pengajuan?.komenPaData, commentKpr: pengajuan?.komenKprData },
            { id: "metode", field: "komen_pa_metode", label: "Metode Pelaksanaan", content: data.metodePenelitian, commentPa: pengajuan?.komenPaMetode, commentKpr: pengajuan?.komenKprMetode },
            { id: "jurnal", field: "", label: "Jurnal Referensi / Lampiran", content: data.jurnalReferensi, commentPa: null, commentKpr: null },
          ].map((section) => (
            <Paper key={section.id} p="xl" radius="lg" withBorder shadow="xs">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Title order={4} className="text-indigo-700 flex items-center gap-2">
                    <Box w={4} h={20} bg="indigo.5" style={{ borderRadius: 2 }} />
                    {section.label}
                  </Title>
                  
                  {isDosenPa && section.field && pengajuan.statusDosenPa === 'menunggu' && (
                    <Button 
                      variant="light" 
                      color="indigo" 
                      size="xs" 
                      radius="md"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => handleAddComment(section.field, section.label, section.commentPa || "")}
                    >
                      Tambah Komentar
                    </Button>
                  )}
                </Group>

                <div className="pl-3">
                  {section.content?.startsWith("<") ? (
                    <Typography>
                      <div
                        dangerouslySetInnerHTML={{ __html: section.content || "" }}
                        className="text-gray-800 leading-relaxed text-sm"
                      />
                    </Typography>
                  ) : (
                    <Text className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                      {section.content || "-"}
                    </Text>
                  )}
                </div>

                {/* Section Specific Comments */}
                {(section.commentPa || section.commentKpr) && (
                  <Stack gap="sm" mt="md">
                    {section.commentPa && (
                      <Paper p="md" radius="md" withBorder bg="indigo.0">
                        <Group justify="space-between" mb={8}>
                          <Group gap={6}>
                            <IconMessage2 size={16} className="text-indigo-600" />
                            <Text size="xs" fw={800} className="text-indigo-600 uppercase tracking-wider">Review Pembimbing</Text>
                          </Group>
                          <Badge variant="light" color="indigo" size="xs">DIREVIEW</Badge>
                        </Group>
                        <Text size="sm" className="text-gray-700 italic font-medium leading-relaxed">
                          &quot;{section.commentPa}&quot;
                        </Text>
                      </Paper>
                    )}
                    {section.commentKpr && (
                      <Paper p="md" radius="md" withBorder bg="teal.0">
                        <Group justify="space-between" mb={8}>
                          <Group gap={6}>
                            <IconMessage2 size={16} className="text-teal-600" />
                            <Text size="xs" fw={800} className="text-teal-600 uppercase tracking-wider">Review Kaprodi</Text>
                          </Group>
                          <Badge variant="light" color="teal" size="xs">DIREVIEW</Badge>
                        </Group>
                        <Text size="sm" className="text-gray-700 italic font-medium leading-relaxed">
                          &quot;{section.commentKpr}&quot;
                        </Text>
                      </Paper>
                    )}
                  </Stack>
                )}
              </Stack>
            </Paper>
          ))}
          
          <Box py="xl" />
        </div>

        {/* Sidebar (Right Side) - Fixed */}
        <div className="w-[340px] h-full bg-white border-l border-gray-200 flex flex-col shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="grow overflow-y-auto p-8">
            <div className="flex items-center gap-2 mb-8">
              <IconSignature size={22} className="text-indigo-600" />
              <Title order={4} className="text-gray-800">Status Persetujuan</Title>
            </div>

            <Timeline
              active={pengajuan.statusKaprodi === 'diterima' ? 2 : (pengajuan.statusDosenPa === 'diterima' ? 1 : 0)}
              bulletSize={36}
              lineWidth={2}
            >
              <Timeline.Item
                bullet={<IconFileText size={18} />}
                title={<Text fw={700} size="sm">Pendaftaran Pengajuan</Text>}
              >
                <div className="mt-1 space-y-1">
                  <Text size="xs" c="dimmed">Diajukan pada:</Text>
                  <Text size="sm" fw={600}>
                    {new Date(pengajuan.tanggalPengajuan).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Text>
                  <Badge size="xs" variant="light" color="blue" className="mt-1">Oleh Mahasiswa</Badge>
                </div>
              </Timeline.Item>

              <Timeline.Item
                bullet={pengajuan.statusDosenPa === 'diterima' ? <IconCircleCheck size={18} /> : <IconClock size={18} />}
                title={<Text fw={700} size="sm">Verifikasi Dosen PA</Text>}
                lineVariant={pengajuan.statusDosenPa === 'menunggu' ? 'dashed' : 'solid'}
              >
                <div className="mt-1 space-y-1">
                  {pengajuan.tanggalReviewPa ? (
                    <>
                      <Text size="xs" c="dimmed">Diverifikasi pada:</Text>
                      <Text size="sm" fw={600} className="text-teal-700">
                        {new Date(pengajuan.tanggalReviewPa).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Text>
                      <Text size="xs" c="dimmed" className="italic">Verifikator: {pengajuan.mahasiswa?.dosenPa?.nama}</Text>
                      <Badge size="xs" variant="filled" color={getStatusColor(pengajuan.statusDosenPa)} className="mt-1">Terverifikasi</Badge>
                    </>
                  ) : (
                    <>
                      <Text size="xs" c="dimmed">Status:</Text>
                      <Text size="sm" className="text-orange-600 font-semibold">Dalam Proses Review</Text>
                      <Badge size="xs" variant="light" color={getStatusColor(pengajuan.statusDosenPa)} className="mt-1">Pending PA</Badge>
                    </>
                  )}
                </div>
              </Timeline.Item>

              <Timeline.Item
                bullet={pengajuan.statusKaprodi === 'diterima' ? <IconCircleCheck size={18} /> : <IconUserExclamation size={18} />}
                title={<Text fw={700} size="sm">Persetujuan Kaprodi</Text>}
              >
                <div className="mt-1 space-y-1">
                  {pengajuan.tanggalReviewKaprodi ? (
                    <>
                      <Text size="xs" c="dimmed">Disetujui pada:</Text>
                      <Text size="sm" fw={600} className="text-indigo-700">
                        {new Date(pengajuan.tanggalReviewKaprodi).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Text>
                      <Text size="xs" c="dimmed" className="italic">Pimpinan: Kaprodi Sistem Informasi</Text>
                      <Badge size="xs" variant="filled" color={getStatusColor(pengajuan.statusKaprodi)} className="mt-1">Disetujui Final</Badge>
                    </>
                  ) : (
                    <>
                      <Text size="xs" c="dimmed">Status:</Text>
                      <Text size="sm" c="dimmed" className="italic">Menunggu Antrean...</Text>
                      <Badge size="xs" variant="outline" color={getStatusColor(pengajuan.statusKaprodi)} className="mt-1">Belum Direview</Badge>
                    </>
                  )}
                </div>
              </Timeline.Item>
            </Timeline>

            {pengajuan.catatanDosenPa && (
              <Paper mt={20} p="md" radius="md" withBorder bg="indigo.0">
                <Text size="xs" fw={800} className="text-indigo-600 uppercase mb-2 flex items-center gap-1">
                  <IconSignature size={14} /> Review Pembimbing (PA)
                </Text>
                <Text size="sm" className="italic text-gray-700 font-medium">
                  &quot;{pengajuan.catatanDosenPa}&quot;
                </Text>
              </Paper>
            )}

            {pengajuan.catatanKaprodi && (
              <Paper mt={20} p="md" radius="md" withBorder bg="teal.0">
                <Text size="xs" fw={800} className="text-teal-600 uppercase mb-2 flex items-center gap-1">
                  <IconSignature size={14} /> Review Kaprodi
                </Text>
                <Text size="sm" className="italic text-gray-700 font-medium">
                  &quot;{pengajuan.catatanKaprodi}&quot;
                </Text>
              </Paper>
            )}

            <Stack mt={50} gap="sm">
              <Button
                onClick={handleDownloadPdf}
                fullWidth
                size="md"
                variant="filled"
                color="indigo"
                radius="md"
                loading={downloadingPdf}
                leftSection={!downloadingPdf && <IconDownload size={20} />}
                className="shadow-lg hover:shadow-indigo-200 transition-all duration-300"
              >
                Download PDF
              </Button>

              {pengajuan.statusKaprodi === "diterima" && (
                <Button
                  onClick={handleDownloadSuratJudul}
                  fullWidth
                  size="md"
                  variant="outline"
                  color="teal"
                  radius="md"
                  loading={downloadingSurat}
                  leftSection={!downloadingSurat && <IconDownload size={18} />}
                  className="shadow-sm hover:shadow-teal-100 transition-all duration-300"
                  styles={{
                    label: { fontSize: "12px" },
                  }}
                >
                  Download Surat Pengajuan Judul
                </Button>
              )}


            </Stack>
          </div>


        </div>
      </div>
    </Modal>
  );
}
