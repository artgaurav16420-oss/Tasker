export enum ErrorCode {
  AUTH_SPOOFING = 'AUTH_SPOOFING',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  EMPLOYEE_FIELD_VIOLATION = 'EMPLOYEE_FIELD_VIOLATION',
  SELF_MANAGE_FORBIDDEN = 'SELF_MANAGE_FORBIDDEN',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

const PG_ERROR_MAP: Record<string, ErrorCode> = {
  '42501': ErrorCode.AUTH_SPOOFING,
  'PGRST116': ErrorCode.MEMBER_NOT_FOUND,
  '23514': ErrorCode.EMPLOYEE_FIELD_VIOLATION,
  'PGRST204': ErrorCode.TASK_NOT_FOUND,
};

const USER_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_SPOOFING]: 'You cannot modify another user\'s data.',
  [ErrorCode.MEMBER_NOT_FOUND]: 'Member not found.',
  [ErrorCode.EMPLOYEE_FIELD_VIOLATION]: 'Only employees can set this field.',
  [ErrorCode.SELF_MANAGE_FORBIDDEN]: 'You cannot manage yourself.',
  [ErrorCode.TASK_NOT_FOUND]: 'Task not found.',
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
};

export function mapPgError(err: unknown): { code: ErrorCode; message: string } {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    const mapped = PG_ERROR_MAP[code];
    if (mapped) return { code: mapped, message: USER_MESSAGES[mapped] };
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: string }).message;
    if (msg.includes('new row violates row-level security')) {
      return { code: ErrorCode.AUTH_SPOOFING, message: USER_MESSAGES[ErrorCode.AUTH_SPOOFING] };
    }
    if (msg.includes('already exists')) {
      return { code: ErrorCode.MEMBER_NOT_FOUND, message: USER_MESSAGES[ErrorCode.MEMBER_NOT_FOUND] };
    }
  }
  return { code: ErrorCode.UNKNOWN, message: USER_MESSAGES[ErrorCode.UNKNOWN] };
}
