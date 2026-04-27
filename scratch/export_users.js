const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportUsersToCsv() {
  console.log("Fetching users from database...");
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      nama: true,
      email: true,
      role: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  const csvRows = [
    ['ID', 'Username', 'Nama', 'Email', 'Role'].join(',')
  ];

  for (const user of users) {
    const row = [
      user.id,
      `"${user.username}"`,
      `"${user.nama}"`,
      `"${user.email || ''}"`,
      `"${user.role?.name || ''}"`
    ];
    csvRows.push(row.join(','));
  }

  const csvContent = csvRows.join('\n');
  const filePath = path.join(__dirname, 'user_list.csv');
  
  fs.writeFileSync(filePath, csvContent);
  
  console.log(`Successfully exported ${users.length} users to: ${filePath}`);
}

exportUsersToCsv()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
