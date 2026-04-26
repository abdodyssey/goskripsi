import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const all = await prisma.pengajuanRancanganPenelitian.findMany({ select: { id: true } })
  console.log(JSON.stringify(all))
}
main()
