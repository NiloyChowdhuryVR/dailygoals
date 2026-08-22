import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawResources = await prisma.savedResource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const resources = rawResources.map((item) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(item.tags);
      } catch {
        tags = item.tags ? item.tags.split(',').map((t) => t.trim()) : [];
      }

      return {
        id: item.id,
        title: item.title,
        url: item.url,
        type: item.type as 'video' | 'playlist',
        whyWatch: item.whyWatch || '',
        tags: Array.isArray(tags) ? tags : [],
        subjectId: item.subjectId || undefined,
        topicId: item.topicId || undefined,
        isWatched: item.isWatched ?? false,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      resources,
    });
  } catch (error: any) {
    console.error('Database GET /api/resources error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch saved resources' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, title, url, type, whyWatch, tags, subjectId, topicId, isWatched } = body;

    // Action: Toggle watched status
    if (action === 'TOGGLE_WATCHED' && id) {
      const existing = await prisma.savedResource.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
      }

      const updated = await prisma.savedResource.update({
        where: { id },
        data: {
          isWatched: isWatched !== undefined ? Boolean(isWatched) : !existing.isWatched,
        },
      });

      return NextResponse.json({
        success: true,
        resource: {
          ...updated,
          tags: JSON.parse(updated.tags || '[]'),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    // Action: Create or Update Resource
    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: 'title and url are required fields' },
        { status: 400 }
      );
    }

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    let saved;
    if (id) {
      saved = await prisma.savedResource.update({
        where: { id },
        data: {
          title,
          url,
          type: type || 'video',
          whyWatch: whyWatch || '',
          tags: tagsJson,
          subjectId: subjectId || null,
          topicId: topicId || null,
          isWatched: isWatched ?? false,
        },
      });
    } else {
      saved = await prisma.savedResource.create({
        data: {
          title,
          url,
          type: type || 'video',
          whyWatch: whyWatch || '',
          tags: tagsJson,
          subjectId: subjectId || null,
          topicId: topicId || null,
          isWatched: isWatched ?? false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      resource: {
        id: saved.id,
        title: saved.title,
        url: saved.url,
        type: saved.type as 'video' | 'playlist',
        whyWatch: saved.whyWatch || '',
        tags: JSON.parse(saved.tags || '[]'),
        subjectId: saved.subjectId || undefined,
        topicId: saved.topicId || undefined,
        isWatched: saved.isWatched,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Database POST /api/resources error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    await prisma.savedResource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Database DELETE /api/resources error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
