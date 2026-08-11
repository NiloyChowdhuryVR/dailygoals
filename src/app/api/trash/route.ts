import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 3 days in milliseconds
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const cutoffDate = new Date(Date.now() - THREE_DAYS_MS);

    // 1. Auto cleanup expired trash items older than 3 days
    await prisma.workflowTrashItem.deleteMany({
      where: {
        deletedAt: {
          lt: cutoffDate,
        },
      },
    });

    // 2. Fetch remaining valid trash items
    const rawItems = await prisma.workflowTrashItem.findMany({
      orderBy: { deletedAt: 'desc' },
    });

    const trashItems = rawItems
      .map((item) => {
        try {
          return {
            id: item.id,
            subjectId: item.subjectId,
            title: item.title,
            snapshot: JSON.parse(item.snapshot),
            deletedAt: item.deletedAt.toISOString(),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      trashItems,
    });
  } catch (error: any) {
    console.error('Database GET /api/trash error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch trash items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, subjectId, title, snapshot } = body;

    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: 'subjectId is required' },
        { status: 400 }
      );
    }

    // Action: Move workflow to 3-day trash
    if (action === 'MOVE_TO_TRASH') {
      const snapshotStr = typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot || {});

      const trashRecord = await prisma.workflowTrashItem.upsert({
        where: { subjectId },
        update: {
          title: title || subjectId,
          snapshot: snapshotStr,
          deletedAt: new Date(),
        },
        create: {
          subjectId,
          title: title || subjectId,
          snapshot: snapshotStr,
          deletedAt: new Date(),
        },
      });

      // Remove from active live progress/custom tables
      await prisma.customSubject.deleteMany({ where: { subjectId } });
      await prisma.subjectProgress.deleteMany({ where: { subjectId } });
      await prisma.deletedSubject.upsert({
        where: { subjectId },
        update: {},
        create: { subjectId },
      });

      return NextResponse.json({
        success: true,
        trashItem: {
          id: trashRecord.id,
          subjectId: trashRecord.subjectId,
          title: trashRecord.title,
          snapshot: JSON.parse(trashRecord.snapshot),
          deletedAt: trashRecord.deletedAt.toISOString(),
        },
      });
    }

    // Action: Restore workflow from trash
    if (action === 'RESTORE') {
      const trashItem = await prisma.workflowTrashItem.findUnique({
        where: { subjectId },
      });

      if (!trashItem) {
        return NextResponse.json(
          { success: false, error: 'Workflow not found in trash' },
          { status: 404 }
        );
      }

      let parsedSnapshot: any = {};
      try {
        parsedSnapshot = JSON.parse(trashItem.snapshot);
      } catch (e) {
        console.error('Failed to parse trash snapshot:', e);
      }

      const { progress, customSubject, documents } = parsedSnapshot;

      // 1. Unmark deletedSubject flag
      await prisma.deletedSubject.deleteMany({ where: { subjectId } });

      // 2. Restore CustomSubject if custom roadmap
      if (customSubject) {
        await prisma.customSubject.upsert({
          where: { subjectId: customSubject.id || subjectId },
          update: {
            title: customSubject.title,
            jsonContent: JSON.stringify(customSubject),
          },
          create: {
            subjectId: customSubject.id || subjectId,
            title: customSubject.title,
            jsonContent: JSON.stringify(customSubject),
          },
        });
      }

      // 3. Restore SubjectProgress & CompletedTasks
      if (progress) {
        const restoredProgress = await prisma.subjectProgress.upsert({
          where: { subjectId },
          update: {
            startDate: progress.startDate || new Date().toISOString().split('T')[0],
            isStarted: progress.isStarted !== undefined ? progress.isStarted : true,
          },
          create: {
            subjectId,
            startDate: progress.startDate || new Date().toISOString().split('T')[0],
            isStarted: progress.isStarted !== undefined ? progress.isStarted : true,
          },
        });

        // Re-create completed tasks
        if (Array.isArray(progress.completedTopicIds)) {
          for (const topicId of progress.completedTopicIds) {
            await prisma.completedTask.upsert({
              where: {
                subjectProgressId_topicId: {
                  subjectProgressId: restoredProgress.id,
                  topicId: String(topicId),
                },
              },
              update: {},
              create: {
                subjectProgressId: restoredProgress.id,
                topicId: String(topicId),
              },
            });
          }
        }
      }

      // 4. Restore Topic Documents
      if (documents && typeof documents === 'object') {
        for (const [topicId, doc] of Object.entries(documents as Record<string, any>)) {
          if (doc && doc.content) {
            await prisma.topicDocument.upsert({
              where: {
                subjectId_topicId: {
                  subjectId,
                  topicId: String(topicId),
                },
              },
              update: {
                title: doc.title || null,
                content: doc.content,
              },
              create: {
                subjectId,
                topicId: String(topicId),
                title: doc.title || null,
                content: doc.content,
              },
            });
          }
        }
      }

      // 5. Delete from trash table
      await prisma.workflowTrashItem.delete({ where: { subjectId } });

      return NextResponse.json({ success: true, restoredSnapshot: parsedSnapshot });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Database POST /api/trash error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process trash request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      // Empty entire trash
      await prisma.workflowTrashItem.deleteMany();
      return NextResponse.json({ success: true });
    }

    // Delete single workflow permanently from trash
    await prisma.workflowTrashItem.deleteMany({
      where: { subjectId },
    });

    // Also clean up any lingering orphan documents
    await prisma.topicDocument.deleteMany({
      where: { subjectId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Database DELETE /api/trash error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete from trash' },
      { status: 500 }
    );
  }
}
