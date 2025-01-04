export interface CommandInterface {
  action?: "execute" | "navigate";
  data?: {
    url?: string;
    action_name?: string;
    args?: Record<string, unknown>;
  };
  message?: string;
  type: "command" | "message";
}
