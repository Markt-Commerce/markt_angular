/**
 * Seller Start Cards Domain Models
 * 
 * Domain entities for seller onboarding/start cards.
 */

export interface StartCardCTA {
  label: string;
  href: string;
}

export interface StartCardProgress {
  current: number;
  target: number;
}

/**
 * Start Card Domain Entity
 */
export class StartCard {
  constructor(
    public readonly key: string,
    public readonly title: string,
    public readonly description: string,
    public readonly cta: StartCardCTA,
    public readonly completed: boolean,
    public readonly progress?: StartCardProgress
  ) {}

  /**
   * Business Rule: Check if card is in progress
   */
  isInProgress(): boolean {
    return !this.completed && this.progress !== undefined;
  }

  /**
   * Business Rule: Get completion percentage
   */
  getCompletionPercentage(): number {
    if (!this.progress) {
      return this.completed ? 100 : 0;
    }
    return Math.min(100, (this.progress.current / this.progress.target) * 100);
  }
}

/**
 * Start Cards Metadata Domain Entity
 */
export class StartCardsMetadata {
  constructor(
    public readonly sellerId: number,
    public readonly generatedAt: string
  ) {}
}

/**
 * Start Cards Response Domain Entity
 */
export class StartCardsResponse {
  constructor(
    public readonly items: StartCard[],
    public readonly metadata: StartCardsMetadata
  ) {}

  /**
   * Business Rule: Get total completion count
   */
  getCompletedCount(): number {
    return this.items.filter(card => card.completed).length;
  }

  /**
   * Business Rule: Get total cards count
   */
  getTotalCount(): number {
    return this.items.length;
  }

  /**
   * Business Rule: Get overall completion percentage
   */
  getOverallCompletion(): number {
    if (this.items.length === 0) {
      return 0;
    }
    return (this.getCompletedCount() / this.getTotalCount()) * 100;
  }

  /**
   * Business Rule: Get incomplete cards
   */
  getIncompleteCards(): StartCard[] {
    return this.items.filter(card => !card.completed);
  }
}

