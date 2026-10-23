import { Booking, UserAccount } from '../types';

/**
 * Validates whether the given user has the authority to cancel a booking.
 * Authority is strictly granted to:
 * 1. Administrator (ADMIN or SUPERADMIN)
 * 2. The account or department that created the booking (e.g., KSA can cancel KSA's booking, but Pemeliharaan cannot).
 */
export function canUserCancelBooking(
  booking: Booking | null | undefined, 
  user: UserAccount | null | undefined
): boolean {
  if (!booking || !user) return false;

  // 1. Admin or Superadmin role has full authority
  const role = (user.role || '').toUpperCase();
  const username = (user.username || '').toLowerCase();
  if (role === 'ADMIN' || role === 'SUPERADMIN' || username === 'admin') {
    return true;
  }

  // 2. Exact Creator ID or username match
  const userId = (user.id || '').toLowerCase();
  const createdById = (booking.createdById || '').toLowerCase();
  if (createdById && (createdById === userId || createdById === username)) {
    return true;
  }

  // 3. Department match (e.g., KSA matches KSA)
  const userDept = (user.department || '').trim().toLowerCase();
  const bookingDept = (booking.department || '').trim().toLowerCase();
  const createdByDept = (booking.createdByDepartment || '').trim().toLowerCase();

  if (userDept) {
    if (bookingDept && userDept === bookingDept) {
      return true;
    }
    if (createdByDept && userDept === createdByDept) {
      return true;
    }
    // Check prefix in bookingNumber (e.g., "KSA-20261012-0001" starts with "KSA-")
    const cleanNumber = (booking.bookingNumber || '').toUpperCase();
    const cleanDept = user.department.trim().toUpperCase();
    if (cleanDept && cleanNumber.startsWith(cleanDept + '-')) {
      return true;
    }
  }

  // 4. Booker name match
  const userName = (user.name || '').trim().toLowerCase();
  const bookerName = (booking.bookerName || '').trim().toLowerCase();
  if (userName && bookerName && userName === bookerName) {
    return true;
  }

  // 5. Email match
  const userEmail = (user.email || '').trim().toLowerCase();
  const bookingEmail = (booking.email || '').trim().toLowerCase();
  if (userEmail && bookingEmail && userEmail === bookingEmail) {
    return true;
  }

  return false;
}
