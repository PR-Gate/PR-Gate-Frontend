import { z } from 'zod';
import type { HttpClient } from '@/shared/services/http/http-client';
import type { ReviewInput, TestDraft } from '../domain/assessment';
import {
  assessmentDtoSchema,
  assessmentListSchema,
  catalogSchema,
} from './assessment.dto';
const root = '/demo/assessments';
export class AssessmentApiService {
  constructor(private readonly http: HttpClient) {}
  async list(signal?: AbortSignal) {
    return assessmentListSchema.parse(
      await this.http.get<unknown>(root, signal),
    );
  }
  async get(id: string, signal?: AbortSignal) {
    return assessmentDtoSchema.parse(
      await this.http.get<unknown>(`${root}/${encodeURIComponent(id)}`, signal),
    );
  }
  async catalog(signal?: AbortSignal) {
    return catalogSchema.parse(
      await this.http.get<unknown>(`${root}/catalog`, signal),
    );
  }
  async save(input: TestDraft, id?: string) {
    return assessmentDtoSchema.parse(
      await this.http.post<unknown>(
        id ? `${root}/${encodeURIComponent(id)}/draft` : root,
        input,
      ),
    );
  }
  async publish(id: string) {
    return assessmentDtoSchema.parse(
      await this.http.post<unknown>(
        `${root}/${encodeURIComponent(id)}/publish`,
        {},
      ),
    );
  }
  async remind(id: string, participantId?: string) {
    return z
      .object({ recipients: z.number().int().nonnegative() })
      .parse(
        await this.http.post<unknown>(
          `${root}/${encodeURIComponent(id)}/reminders`,
          { participantId },
        ),
      );
  }
  async review(id: string, input: ReviewInput) {
    return assessmentDtoSchema.parse(
      await this.http.post<unknown>(
        `${root}/${encodeURIComponent(id)}/reviews`,
        input,
      ),
    );
  }
}
