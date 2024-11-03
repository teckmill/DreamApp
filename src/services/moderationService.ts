import { authService } from './authService';

export type ContentType = 'dream' | 'comment' | 'interpretation' | 'poll' | 'event' | 'group';
export type ReportReason = 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'other';
export type ModAction = 'warn' | 'mute' | 'ban' | 'delete' | 'lock' | 'pin' | 'unpin';
export type ModeratorRole = 'admin' | 'moderator' | 'community_manager';

interface Report {
  id: string;
  contentId: string;
  contentType: ContentType;
  reportedBy: string;
  reportedUser: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  modAction?: ModAction;
}

interface ModLog {
  id: string;
  userId: string;
  action: ModAction;
  reason: string;
  moderatorId: string;
  createdAt: Date;
  expiresAt?: Date;
}

interface Moderator {
  userId: string;
  role: ModeratorRole;
  assignedBy: string;
  assignedAt: Date;
  permissions: {
    canBanUsers: boolean;
    canDeleteContent: boolean;
    canAssignMods: boolean;
    canManageReports: boolean;
  };
}

export const moderationService = {
  createReport(
    contentId: string,
    contentType: ContentType,
    reportedUser: string,
    reportedBy: string,
    reason: ReportReason,
    description: string
  ): Report {
    const report: Report = {
      id: Date.now().toString(),
      contentId,
      contentType,
      reportedBy,
      reportedUser,
      reason,
      description,
      status: 'pending',
      createdAt: new Date()
    };

    const reports = this.getReports();
    reports.push(report);
    localStorage.setItem('moderation_reports', JSON.stringify(reports));

    return report;
  },

  getReports(): Report[] {
    return JSON.parse(localStorage.getItem('moderation_reports') || '[]');
  },

  resolveReport(reportId: string, moderatorId: string, action?: ModAction): void {
    const reports = this.getReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    report.status = 'resolved';
    report.resolvedAt = new Date();
    report.resolvedBy = moderatorId;
    report.modAction = action;

    if (action) {
      this.createModLog(report.reportedUser, action, `Report resolution: ${report.reason}`, moderatorId);
    }

    localStorage.setItem('moderation_reports', JSON.stringify(reports));
  },

  createModLog(userId: string, action: ModAction, reason: string, moderatorId: string, duration?: number): ModLog {
    const log: ModLog = {
      id: Date.now().toString(),
      userId,
      action,
      reason,
      moderatorId,
      createdAt: new Date(),
      expiresAt: duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : undefined
    };

    const logs = this.getModLogs();
    logs.push(log);
    localStorage.setItem('moderation_logs', JSON.stringify(logs));

    return log;
  },

  getModLogs(): ModLog[] {
    return JSON.parse(localStorage.getItem('moderation_logs') || '[]');
  },

  isUserBanned(userId: string): boolean {
    const logs = this.getModLogs();
    const activeBan = logs
      .filter(log => log.action === 'ban' && log.userId === userId)
      .find(log => !log.expiresAt || new Date(log.expiresAt) > new Date());
    return !!activeBan;
  },

  isUserMuted(userId: string): boolean {
    const logs = this.getModLogs();
    const activeMute = logs
      .filter(log => log.action === 'mute' && log.userId === userId)
      .find(log => !log.expiresAt || new Date(log.expiresAt) > new Date());
    return !!activeMute;
  },

  assignModerator(
    userId: string,
    role: ModeratorRole,
    assignedBy: string
  ): Moderator {
    const moderators = this.getModerators();
    if (moderators.length === 0 || this.canAssignModerators(assignedBy)) {
      const moderator: Moderator = {
        userId,
        role,
        assignedBy,
        assignedAt: new Date(),
        permissions: {
          canBanUsers: role === 'admin',
          canDeleteContent: true,
          canAssignMods: role === 'admin',
          canManageReports: true
        }
      };

      moderators.push(moderator);
      localStorage.setItem('moderators', JSON.stringify(moderators));
      return moderator;
    }

    throw new Error('No permission to assign moderators');
  },

  removeModerator(userId: string, removedBy: string): void {
    if (!this.canAssignModerators(removedBy)) {
      throw new Error('No permission to remove moderators');
    }

    const moderators = this.getModerators().filter(mod => mod.userId !== userId);
    localStorage.setItem('moderators', JSON.stringify(moderators));
  },

  getModerators(): Moderator[] {
    return JSON.parse(localStorage.getItem('moderators') || '[]');
  },

  isModerator(userId: string): boolean {
    return this.getModerators().some(mod => mod.userId === userId);
  },

  getModeratorRole(userId: string): ModeratorRole | null {
    const moderator = this.getModerators().find(mod => mod.userId === userId);
    return moderator?.role || null;
  },

  canAssignModerators(userId: string): boolean {
    const user = authService.getUserById(userId);
    if (user?.email === 'teckmillion17@gmail.com') {
      return true;
    }

    const moderator = this.getModerators().find(mod => mod.userId === userId);
    return moderator?.permissions.canAssignMods || false;
  },

  canBanUsers(userId: string): boolean {
    const moderator = this.getModerators().find(mod => mod.userId === userId);
    return moderator?.permissions.canBanUsers || false;
  },

  canManageReports(userId: string): boolean {
    const moderator = this.getModerators().find(mod => mod.userId === userId);
    return moderator?.permissions.canManageReports || false;
  },

  banUser(userId: string): void {
    this.createModLog(userId, 'ban', 'User banned by admin', 'admin');
  },

  unbanUser(userId: string): void {
    const logs = this.getModLogs();
    const updatedLogs = logs.map(log => {
      if (log.userId === userId && log.action === 'ban' && (!log.expiresAt || new Date(log.expiresAt) > new Date())) {
        return { ...log, expiresAt: new Date() };
      }
      return log;
    });
    localStorage.setItem('moderation_logs', JSON.stringify(updatedLogs));
  },

  canModerateContent(userId: string): boolean {
    const moderator = this.getModerators().find(mod => mod.userId === userId);
    return !!moderator || this.isAdmin(userId);
  },

  isAdmin(userId: string): boolean {
    const user = authService.getUserById(userId);
    return user?.email === 'teckmillion17@gmail.com' || 
           this.getModeratorRole(userId) === 'admin';
  },

  canManageEvents(userId: string): boolean {
    return this.canModerateContent(userId);
  },

  canManageGroups(userId: string): boolean {
    return this.canModerateContent(userId);
  },

  canPinContent(userId: string): boolean {
    return this.canModerateContent(userId);
  },

  canLockContent(userId: string): boolean {
    return this.canModerateContent(userId);
  },

  canDeleteContent(userId: string): boolean {
    return this.canModerateContent(userId);
  },

  canManagePolls(userId: string): boolean {
    return this.canModerateContent(userId);
  },

  pinContent(contentId: string, contentType: ContentType, moderatorId: string): void {
    if (!this.canPinContent(moderatorId)) {
      throw new Error('No permission to pin content');
    }
    // Implementation for pinning content
  },

  unpinContent(contentId: string, contentType: ContentType, moderatorId: string): void {
    if (!this.canPinContent(moderatorId)) {
      throw new Error('No permission to unpin content');
    }
    // Implementation for unpinning content
  },

  lockContent(contentId: string, contentType: ContentType, moderatorId: string): void {
    if (!this.canLockContent(moderatorId)) {
      throw new Error('No permission to lock content');
    }
    // Implementation for locking content
  },

  unlockContent(contentId: string, contentType: ContentType, moderatorId: string): void {
    if (!this.canLockContent(moderatorId)) {
      throw new Error('No permission to unlock content');
    }
    // Implementation for unlocking content
  },

  deleteContent(contentId: string, contentType: ContentType, moderatorId: string): void {
    if (!this.canDeleteContent(moderatorId)) {
      throw new Error('No permission to delete content');
    }
    // Implementation for deleting content
  },

  manageEvent(eventId: string, action: 'approve' | 'reject' | 'cancel', moderatorId: string): void {
    if (!this.canManageEvents(moderatorId)) {
      throw new Error('No permission to manage events');
    }
    // Implementation for event management
  },

  manageGroup(groupId: string, action: 'approve' | 'archive' | 'delete', moderatorId: string): void {
    if (!this.canManageGroups(moderatorId)) {
      throw new Error('No permission to manage groups');
    }
    // Implementation for group management
  },

  managePoll(pollId: string, action: 'approve' | 'close' | 'delete', moderatorId: string): void {
    if (!this.canManagePolls(moderatorId)) {
      throw new Error('No permission to manage polls');
    }
    // Implementation for poll management
  },

  getAvailableActions(userId: string): ModAction[] {
    const actions: ModAction[] = [];
    
    if (this.canModerateContent(userId)) {
      actions.push('warn', 'mute', 'delete', 'lock', 'pin', 'unpin');
    }
    
    if (this.canBanUsers(userId)) {
      actions.push('ban');
    }
    
    return actions;
  },

  hasPermission(userId: string, permission: keyof Moderator['permissions']): boolean {
    const moderator = this.getModerators().find(mod => mod.userId === userId);
    return moderator?.permissions[permission] || false;
  }
}; 