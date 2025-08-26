// src/app/api/properties/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cap nhat lai chu ky cua ham GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Khai bao params la mot Promise
) {
  try {
    const { id } = await params; // Su dung await de lay id

    const property = await prisma.property.findUnique({
      where: { id: id },
      include: {
        offices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}