export interface ModerationProps {
  onModAction: (contentId: string, contentType: string, action: string) => Promise<void>;
  isModerator: boolean;
} 