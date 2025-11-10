import { CategoryDto, CategoryTreeDto, TagDto } from './category.dto';

export class Category {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string | null,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly isActive: boolean,
    public readonly parentId: number | null,
    public readonly metadata: Record<string, unknown> | null
  ) {}

  isRoot(): boolean {
    return this.parentId === null;
  }
}

export class CategoryTreeNode {
  constructor(
    public readonly category: Category,
    public readonly children: CategoryTreeNode[] = []
  ) {}

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  flatten(): Category[] {
    return [
      this.category,
      ...this.children.flatMap((child) => child.flatten()),
    ];
  }
}

export interface CategorySummary {
  id: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  childCount: number;
}

export interface Tag {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
}

export const mapCategoryDtoToModel = (dto: CategoryDto): Category =>
  new Category(
    dto.id,
    dto.name,
    dto.slug ?? null,
    dto.description ?? null,
    dto.image_url ?? null,
    dto.is_active,
    dto.parent_id ?? null,
    dto.category_metadata ?? null
  );

export const mapCategoryTreeDtoToNode = (
  dto: CategoryTreeDto
): CategoryTreeNode =>
  new CategoryTreeNode(
    new Category(
      dto.id,
      dto.name,
      dto.slug ?? null,
      null,
      dto.image_url ?? null,
      true,
      null,
      null
    ),
    (dto.children ?? []).map((child) => mapCategoryTreeDtoToNode(child))
  );

export const mapTagDtoToModel = (dto: TagDto): Tag => ({
  id: dto.id,
  name: dto.name,
  slug: dto.slug ?? null,
  description: dto.description ?? null,
});


