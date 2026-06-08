import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const prisma = prismaClient.$extends({
  model: {
    building: {
      async delete({ where }) {
        return prismaClient.building.update({
          where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ where }) {
        return prismaClient.building.updateMany({
          where,
          data: { deletedAt: new Date() },
        });
      },
    },
  },
  query: {
    building: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

export default prisma;
