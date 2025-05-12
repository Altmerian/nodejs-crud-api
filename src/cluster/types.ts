export interface DatabaseMessage {
  type: "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "SYNC_ALL";
  payload: any;
}
