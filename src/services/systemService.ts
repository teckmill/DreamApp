export interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  adCooldownPeriod: number;
  maxDreamsPerUser: number;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDreams: number;
  premiumUsers: number;
  totalRevenue: number;
  reportedContent: number;
}

export const systemService = {
  getSettings(): SystemSettings {
    const settings = localStorage.getItem('dreamscape_system_settings');
    if (!settings) {
      return {
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        adCooldownPeriod: 30,
        maxDreamsPerUser: 100
      };
    }
    return JSON.parse(settings);
  },

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem('dreamscape_system_settings', JSON.stringify(settings));
  },

  updateSetting(key: keyof SystemSettings, value: any): void {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  },

  getSystemStats(): SystemStats {
    // Calculate stats from various services
    const users = JSON.parse(localStorage.getItem('dreamscape_users') || '[]');
    const dreams = Object.keys(localStorage)
      .filter(key => key.startsWith('dreams_'))
      .reduce((acc, key) => acc + JSON.parse(localStorage.getItem(key) || '[]').length, 0);
    const reports = JSON.parse(localStorage.getItem('moderation_reports') || '[]');

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.lastActive > Date.now() - 24 * 60 * 60 * 1000).length,
      totalDreams: dreams,
      premiumUsers: users.filter((u: any) => {
        const subscription = localStorage.getItem(`subscription_${u.id}`);
        return subscription && JSON.parse(subscription).name !== 'Basic';
      }).length,
      totalRevenue: 0, // Implement revenue calculation if needed
      reportedContent: reports.filter((r: any) => r.status === 'pending').length
    };
  },

  deleteUser(userId: string): void {
    // Remove user data
    const users = JSON.parse(localStorage.getItem('dreamscape_users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('dreamscape_users', JSON.stringify(updatedUsers));

    // Remove associated data
    localStorage.removeItem(`dreams_${userId}`);
    localStorage.removeItem(`subscription_${userId}`);
    localStorage.removeItem(`rewards_${userId}`);
    localStorage.removeItem(`ad_history_${userId}`);
  },

  isMaintenanceMode(): boolean {
    return this.getSettings().maintenanceMode;
  },

  isRegistrationAllowed(): boolean {
    return this.getSettings().allowRegistration;
  },

  getAdCooldown(): number {
    return this.getSettings().adCooldownPeriod;
  },

  getDreamLimit(): number {
    return this.getSettings().maxDreamsPerUser;
  },

  getPostLimit(): number {
    return 50; // Default value, could be made configurable
  }
}; 