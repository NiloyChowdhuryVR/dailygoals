import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const whereClause = subjectId ? { subjectId } : {};

    const docs = await prisma.topicDocument.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    // Structure docs as { [subjectId]: { [topicId]: doc } }
    const formattedDocs: Record<string, Record<string, any>> = {};

    docs.forEach((doc) => {
      if (!formattedDocs[doc.subjectId]) {
        formattedDocs[doc.subjectId] = {};
      }
      formattedDocs[doc.subjectId][doc.topicId] = {
        id: doc.id,
        subjectId: doc.subjectId,
        topicId: doc.topicId,
        title: doc.title,
        content: doc.content,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      documents: formattedDocs,
    });
  } catch (error: any) {
    console.error('Database GET /api/documents error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch topic documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjectId, topicId, title, content } = body;

    if (!subjectId || topicId === undefined || topicId === null) {
      return NextResponse.json(
        { success: false, error: 'subjectId and topicId are required' },
        { status: 400 }
      );
    }

    const topicIdStr = String(topicId);

    const savedDoc = await prisma.topicDocument.upsert({
      where: {
        subjectId_topicId: {
          subjectId,
          topicId: topicIdStr,
        },
      },
      update: {
        title: title || null,
        content: content || '',
      },
      create: {
        subjectId,
        topicId: topicIdStr,
        title: title || null,
        content: content || '',
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: savedDoc.id,
        subjectId: savedDoc.subjectId,
        topicId: savedDoc.topicId,
        title: savedDoc.title,
        content: savedDoc.content,
        createdAt: savedDoc.createdAt.toISOString(),
        updatedAt: savedDoc.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Database POST /api/documents error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save topic document' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');

    if (!subjectId || !topicId) {
      return NextResponse.json(
        { success: false, error: 'subjectId and topicId query parameters are required' },
        { status: 400 }
      );
    }

    await prisma.topicDocument.deleteMany({
      where: {
        subjectId,
        topicId: String(topicId),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Database DELETE /api/documents error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete topic document' },
      { status: 500 }
    );
  }
}
