export type SharingPermission = 'public' | 'private' | 'mentors' | 'groups' | 'selected';

interface SharingSettings {
  defaultPermission: SharingPermission;
  allowedUsers: string[];
  allowedGroups: string[];
  allowMentorAccess: boolean;
  allowAIAnalysis: boolean;
  anonymousSharing: boolean;
}

interface SharedContent {
  id: string;
  userId: string;
  contentType: 'dream' | 'interpretation' | 'analysis';
  contentId: string;
  permission: SharingPermission;
  sharedWith: string[];
  sharedAt: Date;
  expiresAt?: Date;
}

export const sharingService = {
  getUserSettings(userId: string): SharingSettings {
    const settings = localStorage.getItem(`sharing_settings_${userId}`);
    if (!settings) {
      return {
        defaultPermission: 'private',
        allowedUsers: [],
        allowedGroups: [],
        allowMentorAccess: false,
        allowAIAnalysis: true,
        anonymousSharing: false
      };
    }
    return JSON.parse(settings);
  },

  saveUserSettings(userId: string, settings: SharingSettings): void {
    localStorage.setItem(`sharing_settings_${userId}`, JSON.stringify(settings));
  },

  getSharedContent(contentId: string): SharedContent | null {
    const content = localStorage.getItem(`shared_content_${contentId}`);
    return content ? JSON.parse(content) : null;
  },

  shareContent(
    userId: string,
    contentType: SharedContent['contentType'],
    contentId: string,
    permission: SharingPermission,
    sharedWith: string[] = [],
    expiresIn?: number // hours
  ): SharedContent {
    const shared: SharedContent = {
      id: Date.now().toString(),
      userId,
      contentType,
      contentId,
      permission,
      sharedWith,
      sharedAt: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 60 * 60 * 1000) : undefined
    };

    localStorage.setItem(`shared_content_${contentId}`, JSON.stringify(shared));
    return shared;
  },

  updateSharing(contentId: string, updates: Partial<SharedContent>): void {
    const content = this.getSharedContent(contentId);
    if (!content) return;

    const updated = { ...content, ...updates };
    localStorage.setItem(`shared_content_${contentId}`, JSON.stringify(updated));
  },

  removeSharing(contentId: string): void {
    localStorage.removeItem(`shared_content_${contentId}`);
  },

  canAccess(userId: string, contentId: string): boolean {
    const content = this.getSharedContent(contentId);
    if (!content) return false;

    // Check if content has expired
    if (content.expiresAt && new Date(content.expiresAt) < new Date()) {
      this.removeSharing(contentId);
      return false;
    }

    // Owner always has access
    if (content.userId === userId) return true;

    switch (content.permission) {
      case 'public':
        return true;
      case 'private':
        return false;
      case 'mentors':
        return this.isUserMentor(userId, content.userId);
      case 'groups':
        return this.isInSharedGroups(userId, content.sharedWith);
      case 'selected':
        return content.sharedWith.includes(userId);
      default:
        return false;
    }
  },

  isUserMentor(userId: string, menteeId: string): boolean {
    // Check if user is a mentor for the mentee
    const mentorships = JSON.parse(localStorage.getItem('mentorships') || '[]');
    return mentorships.some((m: any) => 
      m.mentorId === userId && 
      m.menteeId === menteeId && 
      m.status === 'active'
    );
  },

  isInSharedGroups(userId: string, groupIds: string[]): boolean {
    // Check if user is in any of the shared groups
    const userGroups = JSON.parse(localStorage.getItem(`user_groups_${userId}`) || '[]');
    return groupIds.some(groupId => userGroups.includes(groupId));
  },

  getAccessibleContent(userId: string, contentType?: SharedContent['contentType']): SharedContent[] {
    const allContent: SharedContent[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('shared_content_')) {
        const content: SharedContent = JSON.parse(localStorage.getItem(key) || '');
        if (this.canAccess(userId, content.contentId) && 
            (!contentType || content.contentType === contentType)) {
          allContent.push(content);
        }
      }
    }
    return allContent;
  }
}; 