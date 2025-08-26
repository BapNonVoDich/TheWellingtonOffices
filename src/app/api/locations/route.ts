// src/app/api/locations/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
      include: {
        wards: {
          orderBy: { name: 'asc' },
        }
      }
    });
    return NextResponse.json(districts);
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}