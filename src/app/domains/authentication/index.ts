/**
 * Authentication Domain - Public API
 */

export { User, UserSession } from './models/user.model';
export type { UserRole, Address, BuyerAccountData, SellerAccountData } from './models/user.model';

export type {
  UserDto,
  LoginDto,
  RegisterDto,
  RegisterResponseDto,
  ProfileUpdateDto,
  BuyerAccountCreateDto,
  SellerAccountCreateDto,
  BuyerAccountUpdateDto,
  SellerAccountUpdateDto
} from './models/user.dto';

export { AuthService } from './services/auth.service';
export type { AuthState } from './services/auth.service';

export { UserRepository } from './repositories/user.repository';

