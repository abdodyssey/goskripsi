import sys

file_path = 'src/features/mahasiswa/components/rekap-bimbingan-list.tsx'
with open(file_path, 'r') as f:
    content = f.read()

target = '''    <Stack gap="md">
      <Paper withBorder p="xs" radius="xl" shadow="sm">
        <Group justify="space-between" px="xs" wrap="wrap">
          <Group gap="xs">
            <IconUsers size={20} className="text-gs-primary" stroke={1.5} />
            <Text fw={800} size="sm" tt="uppercase" lts={1} className="text-gs-text-primary">Rekapitulasi Pembimbing</Text>
          </Group>'''

# Actually the tool might have already messed it up. Let's see what it is now.
