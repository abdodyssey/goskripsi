import {
  IconAdjustments,
  IconHome,
  IconBooks,
  IconBriefcase,
  IconUser,
  IconLogout,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from "@tabler/icons-react";
import { Group, ScrollArea, Menu, rem, ActionIcon, Box } from "@mantine/core";
import Link from "next/link";
import { LinksGroup } from "../NavbarLinksGroup/NavbarLinksGroup";
import { UserButton } from "../UserButton/UserButton";
import { Logo } from "../Logo/Logo";
import { useAuth } from "@/features/auth/hooks/use-auth";
import classes from "./NavbarNested.module.css";

interface NavbarNestedProps {
  opened?: boolean;
  onToggle?: () => void;
}

export function NavbarNested({ opened, onToggle }: NavbarNestedProps) {
  const { userResponse, logout } = useAuth();

  const user = userResponse?.user;
  const rawRoles = user?.roles || userResponse?.roles || [];
  const roles = Array.isArray(rawRoles) ? rawRoles.map(String) : [];

  const isMahasiswa = roles.includes("mahasiswa");
  const isDosen = roles.includes("dosen");
  const isKaprodi = roles.includes("kaprodi");
  const isSekprodi = roles.includes("sekprodi");
  const isAdminProdi = roles.includes("admin_prodi");

  const mockdata = [
    { label: "Dashboard", icon: IconHome, link: "/dashboard" },
    ...(isMahasiswa
      ? [
          {
            label: "Skripsi",
            icon: IconBooks,
            initiallyOpened: true,
            links: [
              {
                label: "Pengajuan Ranpel",
                link: "/dashboard/pengajuan-ranpel",
              },
              {
                label: "Pendaftaran Ujian",
                link: "/dashboard/pendaftaran-ujian",
              },
              {
                label: "Jadwal Ujian",
                link: "/dashboard/mahasiswa/jadwal-ujian",
              },
              {
                label: "Hasil Ujian",
                link: "/dashboard/mahasiswa/ujian",
              },
              { label: "Perbaikan Judul", link: "/dashboard/perbaikan-judul" },
            ],
          },
        ]
      : []),
    ...(isDosen || isKaprodi || isSekprodi || isAdminProdi
      ? [
          {
            label: "Skripsi",
            icon: IconBriefcase,
            initiallyOpened: true,
            links: [
              // Fitur Dosen Murni (Hanya jika bukan Kaprodi/Sekprodi)
              ...(isDosen && !isKaprodi && !isSekprodi
                ? [
                    {
                      label: "Pengajuan Ranpel",
                      link: "/dashboard/verifikasi-ranpel",
                    },
                    {
                      label: "Mahasiswa Bimbingan",
                      link: "/dashboard/mahasiswa-bimbingan",
                    },
                  ]
                : []),

              // Fitur Kaprodi
              ...(isKaprodi
                ? [
                    {
                      label: "Pengajuan Ranpel",
                      link: "/dashboard/manajemen-ranpel",
                    },
                    {
                      label: "Rekap Pembimbing",
                      link: "/dashboard/rekap-bimbingan",
                    },
                  ]
                : []),

              // Fitur Administrasi Ujian (Hanya Sekprodi)
              ...(isSekprodi
                ? [
                    {
                      label: "Berkas Pendaftaran",
                      link: "/dashboard/verifikasi-pendaftaran",
                    },
                    {
                      label: "Penjadwalan Ujian",
                      link: "/dashboard/penjadwalan-ujian",
                    },
                  ]
                : []),

              // Fitur Admin Prodi (Rekapitulasi Nilai)
              ...(isAdminProdi || isKaprodi || isSekprodi
                ? [
                    {
                      label: "Rekapitulasi Nilai",
                      link: "/dashboard/rekapitulasi-nilai",
                    },
                  ]
                : []),

              { label: "Jadwal Ujian", link: "/dashboard/jadwal-ujian" },
            ],
          },
        ]
      : []),
    ...(roles.includes("admin") || roles.includes("superadmin")
      ? [
          {
            label: "Data Master",
            icon: IconAdjustments,
            initiallyOpened: true,
            links: [
              {
                label: "Mahasiswa",
                link: "/dashboard/master-data/mahasiswa",
              },
              {
                label: "Dosen",
                link: "/dashboard/master-data/dosen",
              },
              { label: "Fakultas", link: "/dashboard/master-data/fakultas" },
              { label: "Program Studi", link: "/dashboard/master-data/prodi" },
              { label: "Peminatan", link: "/dashboard/master-data/peminatan" },
              { label: "Ruangan", link: "/dashboard/master-data/ruangan" },
              {
                label: "Jenis Ujian",
                link: "/dashboard/master-data/jenis-ujian",
              },
              { label: "Syarat Ujian", link: "/dashboard/master-data/syarat" },
              {
                label: "Keputusan Ujian",
                link: "/dashboard/master-data/keputusan",
              },
            ],
          },
        ]
      : []),
  ];

  const filteredMockdata = mockdata.filter(
    (item) => item && typeof item === "object" && item.label,
  );

  const links = filteredMockdata.map((item, index) => (
    <div
      key={index}
      onClick={() => {
        if (window.innerWidth < 768) onToggle?.();
      }}
    >
      <LinksGroup {...item} mini={!opened} />
    </div>
  ));

  return (
    <nav className={classes.navbar} data-mini={!opened || undefined}>
      <div className={classes.header}>
        <Group
          justify={opened ? "space-between" : "center"}
          align="center"
          wrap="nowrap"
        >
          <Box
            onClick={onToggle}
            className={opened ? classes.logoContainer : classes.logoMiniTrigger}
          >
            <div className={classes.logoWrapper}>
              <Logo mini={!opened} />
            </div>
            {!opened && (
              <div className={classes.iconOverlay}>
                <IconLayoutSidebarRightCollapse size={22} stroke={1.5} />
              </div>
            )}
          </Box>
          {opened && (
            <ActionIcon
              variant="subtle"
              color="gray.0"
              onClick={onToggle}
              size="lg"
              aria-label="Toggle navigation"
            >
              <IconLayoutSidebarLeftCollapse size={22} stroke={1.5} />
            </ActionIcon>
          )}
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <Menu withArrow position="right-start" shadow="sm" width={200}>
          <Menu.Target>
            <UserButton mini={!opened} />
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Akun Saya</Menu.Label>
            <Menu.Item
              component={Link}
              href="/dashboard/profile"
              leftSection={
                <IconUser
                  style={{ width: rem(14), height: rem(14) }}
                  stroke={1.5}
                />
              }
            >
              Lihat Profil
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              onClick={logout}
              leftSection={
                <IconLogout
                  style={{ width: rem(14), height: rem(14) }}
                  stroke={1.5}
                />
              }
            >
              Keluar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </nav>
  );
}
