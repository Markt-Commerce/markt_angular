/**
 * Address Value Object
 * 
 * Shared value object used across multiple domains.
 * Value objects are immutable and defined by their attributes.
 */

export class Address {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly street: string,
    public readonly houseNumber: string,
    public readonly city: string,
    public readonly state: string,
    public readonly country: string,
    public readonly postalCode: string
  ) {
    // Validation
    if (!street || street.trim().length === 0) {
      throw new Error('Street is required');
    }
    if (!city || city.trim().length === 0) {
      throw new Error('City is required');
    }
    if (!state || state.trim().length === 0) {
      throw new Error('State is required');
    }
    if (!country || country.trim().length === 0) {
      throw new Error('Country is required');
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }

  /**
   * Get full address as string
   */
  getFullAddress(): string {
    return `${this.houseNumber} ${this.street}, ${this.city}, ${this.state} ${this.postalCode}, ${this.country}`;
  }

  /**
   * Get coordinates as tuple
   */
  getCoordinates(): [number, number] {
    return [this.latitude, this.longitude];
  }

  /**
   * Check if address is complete
   */
  isComplete(): boolean {
    return !!(
      this.street &&
      this.houseNumber &&
      this.city &&
      this.state &&
      this.country &&
      this.postalCode
    );
  }

  /**
   * Convert to DTO format (for API)
   */
  toDto(): AddressDto {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      street: this.street,
      house_number: this.houseNumber,
      city: this.city,
      state: this.state,
      country: this.country,
      postal_code: this.postalCode
    };
  }

  /**
   * Create from DTO format
   */
  static fromDto(dto: AddressDto): Address {
    return new Address(
      dto.latitude,
      dto.longitude,
      dto.street,
      dto.house_number,
      dto.city,
      dto.state,
      dto.country,
      dto.postal_code
    );
  }
}

/**
 * Address DTO (for API)
 */
export interface AddressDto {
  latitude: number;
  longitude: number;
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

