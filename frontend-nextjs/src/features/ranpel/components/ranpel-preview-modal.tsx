"use client";

import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Box,
  Title,
  ScrollArea,
  Grid,
  TypographyStylesProvider,
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { apiClient } from "@/lib/api-client";
import { SignaturePreview } from "../../../components/SignaturePreview";

interface RanpelPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  pengajuan: PengajuanRancanganPenelitian | null;
  studentName?: string;
  studentNim?: string;
}

export function RanpelPreviewModal({
  opened,
  onClose,
  pengajuan,
  studentName,
  studentNim,
}: RanpelPreviewModalProps) {
  if (!pengajuan || !pengajuan.rancanganPenelitian) return null;

  const data = pengajuan.rancanganPenelitian;

  const handleDownloadPdf = async () => {
    if (!pengajuan) return;

    try {
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
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Pratinjau Dokumen Ranpel"
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      padding={20}
      styles={{
        body: { backgroundColor: "#f8f9fa" },
      }}
    >
      <Stack gap="lg" align="center" py="xl" px="md">
        <Group justify="flex-end" style={{ width: "100%", maxWidth: "800px" }}>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadPdf}
            variant="filled"
            color="indigo"
            radius="md"
          >
            Download PDF (A4)
          </Button>
        </Group>

        {/* Document Area - Simulated A4 */}
        <Box
          style={{
            width: "100%",
            maxWidth: "210mm",
            minHeight: "297mm",
            padding: "25mm 20mm",
            backgroundColor: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            borderRadius: "2px",
            color: "#1a1a1a",
            fontFamily: "'Times New Roman', serif",
            fontSize: "12pt",
            position: "relative",
            margin: "0 auto",
            border: "1px solid #d1d5db",
          }}
        >
          {/* Official Letterhead (Kop Surat) */}
          <Stack align="center" gap={4} mb={30}>
            <Title
              order={3}
              style={{
                fontSize: "14pt",
                fontWeight: 700,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
            </Title>
            <Title
              order={2}
              style={{
                fontSize: "16pt",
                fontWeight: 800,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              UNIVERSITAS GOSKRIPSI INDONESIA
            </Title>
            <Text
              style={{
                fontSize: "11pt",
                fontWeight: 600,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              FAKULTAS ILMU KOMPUTER DAN TEKNOLOGI INFORMASI
            </Text>
            <Text
              style={{ fontSize: "9pt", textAlign: "center", color: "#444" }}
            >
              Jl. Raya Palembang No. 123, Sumatera Selatan | Telp: (0711) 123456
              | help@goskripsi.ac.id
            </Text>

            {/* Official Double Line Border */}
            <Box mt={8} style={{ width: "100%" }}>
              <Box style={{ height: "2px", backgroundColor: "black" }} />
              <Box
                style={{
                  height: "1px",
                  backgroundColor: "black",
                  marginTop: "2px",
                }}
              />
            </Box>
          </Stack>

          {/* Document Title Section */}
          <Stack align="center" gap={10} mb={40}>
            <Title
              order={1}
              style={{
                fontSize: "20pt",
                fontWeight: 800,
                textAlign: "center",
                textDecoration: "underline",
                textUnderlineOffset: "6px",
              }}
            >
              RANCANGAN PENELITIAN SKRIPSI
            </Title>
            <Text fz="sm" fw={500} c="dimmed">
              NOMOR DOKUMEN: RP-FIKTI-
              {String(pengajuan.id).substring(0, 8).toUpperCase()}
            </Text>
          </Stack>

          {/* Student Info Table Style */}
          <Box mb={40} style={{ border: "1px solid #000", padding: "15px" }}>
            <Grid gutter="xs">
              <Grid.Col span={4}>
                <Text fw={700}>NAMA MAHASISWA</Text>
              </Grid.Col>
              <Grid.Col span={8}>
                <Text>: {studentName || "-"}</Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Text fw={700}>NIM</Text>
              </Grid.Col>
              <Grid.Col span={8}>
                <Text>: {studentNim || "-"}</Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Text fw={700}>JUDUL PENELITIAN</Text>
              </Grid.Col>
              <Grid.Col span={8}>
                <Text style={{ fontWeight: 800 }}>
                  : &ldquo;{data.judulPenelitian}&rdquo;
                </Text>
              </Grid.Col>
            </Grid>
          </Box>

          {/* Content Sections */}
          <Stack gap={25}>
            {[
              {
                num: "I.",
                label: "MASALAH DAN PENYEBAB",
                content: data.masalahDanPenyebab,
              },
              {
                num: "II.",
                label: "ALTERNATIF SOLUSI",
                content: data.alternatifSolusi,
              },
              {
                num: "III.",
                label: "HASIL YANG DIHARAPKAN",
                content: data.hasilYangDiharapkan,
              },
              {
                num: "IV.",
                label: "KEBUTUHAN DATA",
                content: data.kebutuhanData,
              },
              {
                num: "V.",
                label: "METODE PELAKSANAAN",
                content: data.metodePenelitian,
              },
            ].map((section) => (
              <Box key={section.num}>
                <Stack gap={8}>
                  <Text fw={800} style={{ fontSize: "12pt" }}>
                    {section.num} {section.label}
                  </Text>
                  <Box pl={20}>
                    {section.content?.startsWith("<") ? (
                      <TypographyStylesProvider>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: section.content || "",
                          }}
                          style={{
                            textAlign: "justify",
                            lineHeight: 1.6,
                            color: "#000",
                            fontSize: "12pt",
                          }}
                        />
                      </TypographyStylesProvider>
                    ) : (
                      <Text
                        style={{
                          textAlign: "justify",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.6,
                          color: "#000",
                        }}
                      >
                        {section.content || "-"}
                      </Text>
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Signature Area */}
          <Box mt={100} style={{ pageBreakInside: "avoid" }}>
            <Group justify="flex-end" mb={40}>
              <Text style={{ fontSize: "12pt", fontWeight: 500 }}>
                Palembang,{" "}
                {new Date(
                  pengajuan?.tanggalReviewKaprodi ||
                    pengajuan?.tanggalReviewPa ||
                    new Date(),
                ).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </Text>
            </Group>

            <Text mb={20} fw={700}>
              Menyetujui:
            </Text>

            <Grid gutter={50} style={{ fontSize: "12pt" }}>
              <Grid.Col span={6}>
                <Stack gap={0}>
                  <Text fw={500}>Dosen PA,</Text>
                  <Box h={100} style={{ position: "relative" }}>
                    {((pengajuan?.statusKaprodi === "menunggu" &&
                      pengajuan.statusDosenPa === "diterima") ||
                      pengajuan?.statusKaprodi === "diterima") && (
                      <SignaturePreview
                        url={pengajuan.mahasiswa?.dosenPa?.urlTtd as string}
                        height={80}
                      />
                    )}
                  </Box>
                  <Text
                    fw={800}
                    style={{
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                    }}
                  >
                    {pengajuan.mahasiswa?.dosenPa?.nama || "Nama Dosen PA"}
                  </Text>
                  <Text>
                    NIP.{" "}
                    {pengajuan.mahasiswa?.dosenPa?.nip ||
                      "........................."}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap={0}>
                  <Text fw={500}>Penulis,</Text>
                  <Box h={100} style={{ position: "relative" }}>
                    <SignaturePreview
                      url={pengajuan.mahasiswa?.urlTtd as string}
                      height={80}
                    />
                  </Box>
                  <Text
                    fw={800}
                    style={{
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                    }}
                  >
                    {studentName}
                  </Text>
                  <Text>NIM. {studentNim}</Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>

          {/* Footer Info */}
          <Box mt={60}>
            <Text fw={500}>Lampiran:</Text>
            <Text fs="italic" size="sm" mb="md">
              *Bentuk sesuai dengan tinjauan pustaka
            </Text>

            <Text fw={500}>Jurnal Referensi:</Text>
            <Box pl={20}>
              {data.jurnalReferensi?.startsWith("<") ? (
                <TypographyStylesProvider>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data.jurnalReferensi || "",
                    }}
                    style={{
                      textAlign: "justify",
                      lineHeight: 1.6,
                      color: "#000",
                      fontSize: "11pt",
                    }}
                  />
                </TypographyStylesProvider>
              ) : (
                <Text
                  size="sm"
                  style={{
                    textAlign: "justify",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    color: "#000",
                  }}
                >
                  {data.jurnalReferensi || "-"}
                </Text>
              )}
            </Box>
          </Box>
        </Box>
      </Stack>
    </Modal>
  );
}
