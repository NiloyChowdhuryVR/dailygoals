import { SavedResource, SubjectData } from '@/types/learning';

/**
 * Robust matching helper to check if a saved resource belongs to a specific learning track / subject roadmap.
 */
export function doesResourceMatchSubject(
  res: SavedResource,
  subject: SubjectData | null | undefined
): boolean {
  if (!res || !subject) return false;

  const resTags = (res.tags || []).map((t) => t.toLowerCase().trim());
  const subjectId = (subject.id || '').toLowerCase().trim();
  const subjectTitle = (subject.title || '').toLowerCase().trim();
  const subjectCategory = (subject.category || '').toLowerCase().trim();

  // 1. Direct match with subject category (e.g. "AI / LLMs", "Software Architecture", "Next.js / Web")
  if (subjectCategory && resTags.includes(subjectCategory)) {
    return true;
  }

  // 2. Direct tag match with subject ID or Title
  if (
    resTags.includes(subjectId) ||
    resTags.some((t) => subjectTitle.includes(t) || t.includes(subjectId))
  ) {
    return true;
  }

  // 3. Category Aliases mapping for known tracks
  const categoryAliases: Record<string, string[]> = {
    'ai-engineer': ['ai / llms', 'artificial intelligence', 'machine learning', 'ai', 'llm', 'python', 'deep learning'],
    'oops-mastery': ['oop & architecture', 'software architecture', 'oops', 'oop', 'design patterns', 'clean code'],
    'nextjs-mastery': ['next.js / web', 'next.js', 'react', 'web development', 'frontend'],
    'sql': ['sql', 'database', 'rdbms', 'postgresql', 'mysql', 'sql and relational database management systems'],
  };

  // Check if subject ID contains keywords
  let matchedAliasKey: string | null = null;
  if (subjectId.includes('ai') || subjectTitle.includes('ai engineer')) matchedAliasKey = 'ai-engineer';
  else if (subjectId.includes('oop') || subjectTitle.includes('object-oriented')) matchedAliasKey = 'oops-mastery';
  else if (subjectId.includes('next') || subjectTitle.includes('next.js')) matchedAliasKey = 'nextjs-mastery';
  else if (subjectId.includes('sql') || subjectTitle.includes('sql') || subjectTitle.includes('database')) matchedAliasKey = 'sql';

  if (matchedAliasKey && categoryAliases[matchedAliasKey]) {
    const aliases = categoryAliases[matchedAliasKey];
    if (aliases.some((alias) => resTags.includes(alias))) {
      return true;
    }
  }

  // 4. Fallback check on res.subjectId
  if (res.subjectId === subject.id) {
    // Ensure tags don't explicitly belong to another distinct track
    const conflictsWithOtherTrack = Object.entries(categoryAliases).some(([key, aliases]) => {
      if (matchedAliasKey && key === matchedAliasKey) return false;
      return aliases.some((alias) => resTags.includes(alias));
    });

    if (!conflictsWithOtherTrack) {
      return true;
    }
  }

  return false;
}
