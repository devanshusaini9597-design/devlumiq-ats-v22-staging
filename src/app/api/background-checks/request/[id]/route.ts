import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/background-checks/request/:id - Delete a background check
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if background check exists
    const existingCheck = await prisma.backgroundCheck.findUnique({
      where: { id },
    });

    if (!existingCheck) {
      return NextResponse.json(
        { error: 'Background check not found' },
        { status: 404 }
      );
    }

    // Delete the background check
    await prisma.backgroundCheck.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Background check deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting background check:', error);
    return NextResponse.json(
      { error: 'Failed to delete background check' },
      { status: 500 }
    );
  }
}

// GET /api/background-checks/request/:id - Get single background check
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const check = await prisma.backgroundCheck.findUnique({
      where: { id },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        application: {
          select: {
            job: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json(
        { error: 'Background check not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(check);
  } catch (error) {
    console.error('Error fetching background check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background check' },
      { status: 500 }
    );
  }
}
