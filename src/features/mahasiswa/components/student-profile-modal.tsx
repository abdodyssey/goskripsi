"use client";
import { useQuery } from "@tanstack/react-query";
import { ujianService } from "@/features/ujian/api/ujian.service";

import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Avatar,
  Divider,
  Grid,
  Badge,
  Paper,
  Box,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconSchool,
  IconId,
  IconCalendarEvent,
  IconDownload,
} from "@tabler/icons-react";
import { Mahasiswa } from "@/types/user.type";

interface StudentProfileModalProps {
  opened: boolean;
  onClose: () => void;
  student: Mahasiswa | null;
}

export function StudentProfileModal({
  opened,
  onClose,
  student,
}: StudentProfileModalProps) {
  const { data: examsData } = useQuery({
    queryKey: ["student-exams", student?.id],
    queryFn: () => ujianService.getByMahasiswa(student!.id.toString()),
    enabled: !!student && opened,
  });

  if (!student) return null;

  const exams = (examsData as any)?.data || [];

  const getExamForStage = (stageId: number) => {
    return exams.find(
      (ex: any) =>
        ex.pendaftaranUjian?.jenisUjianId === stageId &&
        ex.status === "selesai",
    );
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const infoItems = [
    { icon: IconId, label: "NIM", value: student.nim || "-" },
    {
      icon: IconSchool,
      label: "Program Studi",
      value: student.prodi?.nama_prodi || "-",
    },
    {
      icon: IconCalendarEvent,
      label: "Angkatan",
      value: student.angkatan || "-",
    },
    {
      icon: IconCalendarEvent,
      label: "Semester",
      value: student.semester || "-",
    },
    { icon: IconMail, label: "Email", value: student.email || "-" },
    {
      icon: IconPhone,
      label: "No. HP",
      value: student.no_hp || "-",
    },
  ];

  const status = student.status || "aktif";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconUser
            size={20}
            stroke={2}
            color="var(--mantine-primary-color-filled)"
          />
          <Text fw={700} fz="lg">
            Profil Mahasiswa
          </Text>
        </Group>
      }
      size="lg"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: { padding: "24px 24px 16px" },
        body: { padding: "0 24px 24px" },
      }}
    >
      <Stack gap="xl" py="md">
        {/* Profile Header Card */}
        <Paper withBorder p="xl" radius="md">
          <Group gap="xl" wrap="nowrap" align="center">
            <Avatar size={100} radius={100} color="indigo" variant="filled">
              <IconUser size={50} />
            </Avatar>
            <Stack gap={4} flex={1}>
              <Text fz={24} fw={800} style={{ lineHeight: 1.2 }}>
                {student.nama || "-"}
              </Text>
              <Group gap="xs">
                <Badge variant="filled" color="indigo" radius="sm">
                  MAHASISWA
                </Badge>
                <Badge
                  variant="dot"
                  color={status === "aktif" ? "teal" : "gray"}
                  radius="sm"
                >
                  {status.toUpperCase()}
                </Badge>
              </Group>

              {/* Progress Exams Badge */}
              <Group gap={6} mt={6}>
                {!student.passed_exams || student.passed_exams.length === 0 ? (
                  <Badge 
                    variant="outline" 
                    color="gray" 
                    size="xs" 
                    radius="xs"
                    styles={{ label: { fontSize: '9px', fontWeight: 700 } }}
                  >
                    PROSES BIMBINGAN
                  </Badge>
                ) : (
                  [
                    { id: 1, label: "SEM-PROP", color: "blue" },
                    { id: 2, label: "UJIAN-HASIL", color: "cyan" },
                    { id: 3, label: "SKRIPSI", color: "teal" },
                  ].map((stage) => {
                    const exam = getExamForStage(stage.id);
                    const isPassed = student.passed_exams?.includes(stage.id);

                    if (!isPassed) return null;

                    return (
                      <Group key={stage.id} gap={4}>
                        <Badge
                          variant="filled"
                          color={stage.color}
                          size="xs"
                          radius="xs"
                          styles={{
                            label: { fontSize: "9px", fontWeight: 700 },
                          }}
                        >
                          {stage.label}
                        </Badge>
                        {exam && (
                          <Box
                            component="a"
                            href={`${baseUrl}/api/ujian/${exam.id}/pdf/bulk`}
                            target="_blank"
                            className="hover:text-indigo-600 transition-colors"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <IconDownload size={12} stroke={2} />
                          </Box>
                        )}
                      </Group>
                    );
                  })
                )}
              </Group>
              <Text fz="sm" c="dimmed" mt={4}>
                Mahasiswa aktif di Program Studi{" "}
                {student.prodi?.nama_prodi || "-"}
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* Detailed Info Grid */}
        <Box>
          <Text fw={700} fz="sm" c="dimmed" tt="uppercase" mb="md" mt="sm">
            Data Akademik & Kontak
          </Text>
          <Grid gutter="lg">
            {infoItems.map((item, idx) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={idx}>
                <Group gap="md">
                  <Box
                    p={8}
                    bg="var(--mantine-primary-color-light)"
                    style={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <item.icon
                      size={20}
                      color="var(--mantine-primary-color-filled)"
                    />
                  </Box>
                  <Stack gap={0}>
                    <Text fz="xs" c="dimmed" fw={500}>
                      {item.label}
                    </Text>
                    <Text fz="sm" fw={600}>
                      {item.value}
                    </Text>
                  </Stack>
                </Group>
              </Grid.Col>
            ))}
          </Grid>
        </Box>

        <Divider variant="dashed" />

        {/* Supervision Info */}
        <Box>
          <Text fw={700} fz="sm" c="dimmed" tt="uppercase" mb="md">
            Dosen Pembimbing
          </Text>
          <Grid gutter="lg">
            <Grid.Col span={12}>
              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fz="sm" fw={700}>
                      Dosen PA
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {typeof student.dosen_pa === "object"
                        ? student.dosen_pa?.nama
                        : "-"}
                    </Text>
                  </Group>
                  <Divider variant="dotted" />
                  <Group justify="space-between">
                    <Text fz="sm" fw={700}>
                      Pembimbing 1
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {typeof student.pembimbing_1 === "object"
                        ? student.pembimbing_1?.nama
                        : "Belum Ditentukan"}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fz="sm" fw={700}>
                      Pembimbing 2
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {typeof student.pembimbing_2 === "object"
                        ? student.pembimbing_2?.nama
                        : "Belum Ditentukan"}
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Address */}
        <Box>
          <Text fw={700} fz="sm" c="dimmed" tt="uppercase" mb="xs">
            Alamat Domisili
          </Text>
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <IconMapPin
              size={18}
              color="var(--mantine-color-dimmed)"
              style={{ marginTop: 2 }}
            />
            <Text fz="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
              {student.alamat || "Alamat belum ditambahkan oleh mahasiswa."}
            </Text>
          </Group>
        </Box>

        <Group justify="flex-end" mt="xl">
          <Button onClick={onClose} variant="light" radius="md">
            Tutup
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
