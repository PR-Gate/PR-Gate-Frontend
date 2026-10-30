import type { Project } from '../../domain/entities/project.entity';
import type { ProjectResponseDto } from '../dto/project-response.dto';
export function mapProject(dto: ProjectResponseDto): Project {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    course: dto.course_name,
    status: dto.status === 'ACTIVE' ? 'active' : 'archived',
    repositoryUrl: dto.repository_url,
    memberCount: dto.member_count,
    updatedAt: new Date(dto.updated_at),
  };
}
