// src/types/index.ts
import { Prisma } from '@prisma/client';

// Type cho trang chủ (đã có)
export type PropertyWithOffices = Prisma.PropertyGetPayload<{
  include: {
    ward: true,
    offices: true
  }
}>;

// Type MOI cho trang chi tiết (bao gồm cả District và OldWard)
export type PropertyWithDetails = Prisma.PropertyGetPayload<{
  include: {
    offices: true,
    ward: {
      include: {
        district: true
      }
    },
    oldWard: {
      include: {
        district: true
      }
    }
  }
}>;