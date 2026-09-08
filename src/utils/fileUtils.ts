import { AttachedDocument } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Returns all attachments from a booking, handling both modern multi-file `attachments` array
 * and legacy single-file `invitationLetter`.
 */
export const getBookingAttachments = (
  booking?: { attachments?: AttachedDocument[]; invitationLetter?: AttachedDocument | null } | null
): AttachedDocument[] => {
  if (!booking) return [];
  if (Array.isArray(booking.attachments) && booking.attachments.length > 0) {
    return booking.attachments;
  }
  if (booking.invitationLetter) {
    return [booking.invitationLetter];
  }
  return [];
};
