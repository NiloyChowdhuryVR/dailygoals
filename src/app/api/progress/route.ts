import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const allProgress = await prisma.subjectProgress.findMany({
      include: {
        completedTasks: true,
      },
    });

    const customSubjects = await prisma.customSubject.findMany();
    const deletedRecords = await prisma.deletedSubject.findMany();

    const formattedProgress: Record<string, any> = {};
    allProgress.forEach((p) => {
      formattedProgress[p.subjectId] = {
        subjectId: p.subjectId,
        startDate: p.startDate,
        completedTopicIds: p.completedTasks.map((t) => t.topicId),
      };
    });

    const parsedCustomSubjects = customSubjects
      .map((s) => {
        try {
          return JSON.parse(s.jsonContent);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const deletedSubjectIds = deletedRecords.map((d) => d.subjectId);

    return NextResponse.json({
      success: true,
      progress: formattedProgress,
      customSubjects: parsedCustomSubjects,
      deletedSubjectIds,
    });
  } catch (error: any) {
    console.error('Database GET /api/progress error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, subjectId, startDate, topicId, customSubject } = body;

    // Action: Delete subject
    if (action === 'DELETE_SUBJECT' && subjectId) {
      await prisma.deletedSubject.upsert({
        where: { subjectId },
        update: {},
        create: { subjectId },
      });
      await prisma.customSubject.deleteMany({
        where: { subjectId },
      });
      await prisma.subjectProgress.deleteMany({
        where: { subjectId },
      });
      return NextResponse.json({ success: true });
    }

    // Action: Restore default subjects
    if (action === 'RESTORE_DEFAULT_SUBJECTS') {
      await prisma.deletedSubject.deleteMany();
      return NextResponse.json({ success: true });
    }

    // Action: Import custom subject
    if (action === 'IMPORT_CUSTOM_SUBJECT' && customSubject) {
      // Remove from deleted list if it was deleted previously
      await prisma.deletedSubject.deleteMany({
        where: { subjectId: customSubject.id },
      });
      await prisma.customSubject.upsert({
        where: { subjectId: customSubject.id },
        update: {
          title: customSubject.title,
          jsonContent: JSON.stringify(customSubject),
        },
        create: {
          subjectId: customSubject.id,
          title: customSubject.title,
          jsonContent: JSON.stringify(customSubject),
        },
      });
      return NextResponse.json({ success: true });
    }

    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'subjectId is required' }, { status: 400 });
    }

    let dbProgress = await prisma.subjectProgress.findUnique({
      where: { subjectId },
      include: { completedTasks: true },
    });

    if (!dbProgress) {
      dbProgress = await prisma.subjectProgress.create({
        data: {
          subjectId,
          startDate: startDate || new Date().toISOString().split('T')[0],
        },
        include: { completedTasks: true },
      });
    } else if (startDate && dbProgress.startDate !== startDate) {
      await prisma.subjectProgress.update({
        where: { subjectId },
        data: { startDate },
      });
    }

    if (topicId !== undefined) {
      const topicIdStr = String(topicId);
      const existing = await prisma.completedTask.findUnique({
        where: {
          subjectProgressId_topicId: {
            subjectProgressId: dbProgress.id,
            topicId: topicIdStr,
          },
        },
      });

      if (existing) {
        await prisma.completedTask.delete({
          where: { id: existing.id },
        });
      } else {
        await prisma.completedTask.create({
          data: {
            subjectProgressId: dbProgress.id,
            topicId: topicIdStr,
          },
        });
      }
    }

    if (action === 'RESET_PROGRESS') {
      await prisma.completedTask.deleteMany({
        where: { subjectProgressId: dbProgress.id },
      });
      if (startDate) {
        await prisma.subjectProgress.update({
          where: { subjectId },
          data: { startDate },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Database POST /api/progress error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync progress' },
      { status: 500 }
    );
  }
}
