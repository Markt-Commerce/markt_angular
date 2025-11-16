import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  StoryCreateDto,
  StoryDto,
} from '../models/post.dto';
import { Story } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class StoryRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/socials/stories';

  private toDomain(dto: StoryDto): Story {
    return Story.fromDto(dto);
  }

  findAll(): Observable<Story[]> {
    return this.apiClient
      .get<StoryDto[]>(this.baseEndpoint)
      .pipe(
        map((response) => (response.data ?? []).map((dto) => this.toDomain(dto)))
      );
  }

  findById(id: string): Observable<Story> {
    return this.apiClient
      .get<StoryDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  create(dto: StoryCreateDto): Observable<Story> {
    return this.apiClient
      .post<StoryDto>(this.baseEndpoint, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  delete(id: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${id}`)
      .pipe(map(() => undefined));
  }
}

