import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  CollectionCreateDto,
  CollectionDto,
  CollectionUpdateDto,
} from '../models/post.dto';
import { Collection } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class CollectionRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/socials/collections';

  private toDomain(dto: CollectionDto): Collection {
    return Collection.fromDto(dto);
  }

  findAll(): Observable<Collection[]> {
    return this.apiClient
      .get<CollectionDto[]>(this.baseEndpoint)
      .pipe(
        map((response) => (response.data ?? []).map((dto) => this.toDomain(dto)))
      );
  }

  findById(id: string): Observable<Collection> {
    return this.apiClient
      .get<CollectionDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  create(dto: CollectionCreateDto): Observable<Collection> {
    return this.apiClient
      .post<CollectionDto>(this.baseEndpoint, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  update(id: string, dto: CollectionUpdateDto): Observable<Collection> {
    return this.apiClient
      .put<CollectionDto>(`${this.baseEndpoint}/${id}`, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  delete(id: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${id}`)
      .pipe(map(() => undefined));
  }
}

