interface SystemSettings {
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  adCooldownPeriod: number;
  maxDreamsPerUser: number;
  maxPostsPerUser: number;
  requireEmailVerification: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  allowNewRegistrations: true,
  maintenanceMode: false,
  adCooldownPeriod: 1,
  maxDreamsPerUser: 100,
  maxPostsPerUser: 50,
  requireEmailVerification: true
};

export const systemService = {
  getSettings(): SystemSettings {
    const settings = localStorage.getItem('dreamscape_system_settings');
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  },

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem('dreamscape_system_settings', JSON.stringify(settings));
  },

  isMaintenanceMode(): boolean {
    return this.getSettings().maintenanceMode;
  },

  isRegistrationAllowed(): boolean {
    return this.getSettings().allowNewRegistrations;
  },

  getAdCooldown(): number {
    return this.getSettings().adCooldownPeriod;
  },

  getDreamLimit(): number {
    return this.getSettings().maxDreamsPerUser;
  },

  getPostLimit(): number {
    return this.getSettings().maxPostsPerUser;
  }
}; 