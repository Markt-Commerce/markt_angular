/**
 * Chat Domain - Public API
 */

export {
  ChatDiscount,
  ChatMessage,
  ChatParticipant,
  ChatProductSummary,
  ChatRequestSummary,
  ChatRoom,
  ChatRoomSummary,
  LastMessagePreview
} from './models/chat.model';
export type {
  ChatMessageType,
  ChatRoomsResult,
  ChatMessagesResult,
  ChatDiscountResponse,
  DiscountApplicationResult,
  DiscountCancellationResult
} from './models/chat.model';
export type {
  ChatRoomDto,
  ChatRoomListDto,
  ChatMessageDto,
  ChatMessageListDto,
  CreateChatRoomDto,
  SendMessageDto,
  SendOfferDto,
  ChatMessageReactionSummaryDto,
  CreateChatDiscountDto,
  DiscountResponseRequestDto
} from './models/chat.dto';
export { ChatService } from './services/chat.service';
export { ChatRepository } from './repositories/chat.repository';
