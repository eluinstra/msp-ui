import {PrismaClient} from "@prisma/client"
export * from "@prisma/client"

export default function prisma(): PrismaClient {
  globalThis.prisma = globalThis.prisma || new PrismaClient()
  return globalThis.prisma
}