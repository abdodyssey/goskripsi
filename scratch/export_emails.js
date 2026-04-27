const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportEmailsToTxt() {
  console.log("Fetching emails from database...");
  
  const users = await prisma.user.findMany({
    select: {
      email: true
    },
    where: {
      email: {
        not: null,
        not: ''
      }
    },
    orderBy: {
      email: 'asc'
    }
  });

  const emails = users.map(u => u.email);
  const content = emails.join('\n');
  const filePath = path.join(__dirname, 'emails_only.txt');
  
  fs.writeFileSync(filePath, content);
  
  console.log(`Successfully exported ${users.length} emails to: ${filePath}`);
}

exportEmailsToTxt()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
