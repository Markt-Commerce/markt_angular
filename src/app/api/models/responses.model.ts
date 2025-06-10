import { BuyerDetails } from './buyer.model';
import { SellerDetails } from './seller.model';
import { UserDetails } from './user.model';

export interface ClassicResponse {
  message: string;
  success: boolean;
  data?: any; // Optional data field to hold additional information
}

export interface SellerResponse {
  seller: SellerDetails;
  user: UserDetails;
}

export interface BuyerResponse {
  buyer: BuyerDetails;
  user: UserDetails;
}
