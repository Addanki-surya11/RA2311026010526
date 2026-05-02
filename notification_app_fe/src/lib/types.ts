export interface Notification {
  ID: string;
  Type: "Event" | "Result" | "Placement";
  Message: string;
  Timestamp: string;
}

export interface ScoredNotification extends Notification {
  _priority: number;
  _viewed: boolean;
}

export interface ApiResponse {
  notifications: Notification[];
}
