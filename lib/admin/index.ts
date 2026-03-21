/**
 * lib/admin — admin domain constants and permission helpers.
 */
export const AdminAction = {
  UPDATE_SUBSCRIPTION: 'ADMIN_UPDATE_SUBSCRIPTION',
  BAN_USER: 'ADMIN_BAN_USER',
  TOGGLE_FLAG: 'ADMIN_TOGGLE_FLAG',
  VIEW_AUDIT_LOG: 'ADMIN_VIEW_AUDIT_LOG',
} as const;

export type AdminActionType = (typeof AdminAction)[keyof typeof AdminAction];
