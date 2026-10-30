export type ProjectStatus = 'active' | 'archived';
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly course: string;
  readonly status: ProjectStatus;
  readonly repositoryUrl: string | null;
  readonly memberCount: number;
  readonly updatedAt: Date;
}

// A presentation eligibility rule, never an academic evaluation.
export function canOpenRepository(project: Project): boolean {
  if (!project.repositoryUrl) return false;
  try {
    return new URL(project.repositoryUrl).protocol === 'https:';
  } catch {
    return false;
  }
}
