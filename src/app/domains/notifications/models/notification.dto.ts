/**
 * Notification DTOs
 */

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

