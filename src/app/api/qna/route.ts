import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const whereClause = subjectId ? { subjectId } : {};

    const rawQnas = await prisma.topicQna.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Structure qnas as { [subjectId]: { [topicId]: TopicQna[] } }
    const formattedQnas: Record<string, Record<string, any[]>> = {};

    rawQnas.forEach((item) => {
      if (!formattedQnas[item.subjectId]) {
        formattedQnas[item.subjectId] = {};
      }
      if (!formattedQnas[item.subjectId][item.topicId]) {
        formattedQnas[item.subjectId][item.topicId] = [];
      }

      formattedQnas[item.subjectId][item.topicId].push({
        id: item.id,
        subjectId: item.subjectId,
        topicId: item.topicId,
        question: item.question,
        answer: item.answer,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      });
    });

    return NextResponse.json({
      success: true,
      qnas: formattedQnas,
    });
  } catch (error: any) {
    console.error('Database GET /api/qna error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch Q&As' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, subjectId, topicId, question, answer } = body;

    if (!subjectId || topicId === undefined || topicId === null || !question || !answer) {
      return NextResponse.json(
        { success: false, error: 'subjectId, topicId, question, and answer are required' },
        { status: 400 }
      );
    }

    const topicIdStr = String(topicId);

    let savedQna;

    if (id) {
      // Update existing record
      savedQna = await prisma.topicQna.update({
        where: { id },
        data: {
          question: question.trim(),
          answer: answer.trim(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new record
      savedQna = await prisma.topicQna.create({
        data: {
          subjectId,
          topicId: topicIdStr,
          question: question.trim(),
          answer: answer.trim(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      qna: {
        id: savedQna.id,
        subjectId: savedQna.subjectId,
        topicId: savedQna.topicId,
        question: savedQna.question,
        answer: savedQna.answer,
        createdAt: savedQna.createdAt.toISOString(),
        updatedAt: savedQna.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Database POST /api/qna error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save Q&A' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Q&A ID is required for deletion' },
        { status: 400 }
      );
    }

    await prisma.topicQna.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Q&A deleted successfully',
    });
  } catch (error: any) {
    console.error('Database DELETE /api/qna error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete Q&A' },
      { status: 500 }
    );
  }
}
