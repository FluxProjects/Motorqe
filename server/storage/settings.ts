import { db } from "../db";
import { Setting, InsertSetting } from "@shared/schema";

export interface ISettingStorage {

    getSettings(): Promise<Setting>;
    updateSettings(updates: Partial<InsertSetting>): Promise<Setting>;

    // Email Config operations
    getEmailConfig(): Promise<Setting['emailConfig']>;
    updateEmailConfig(config: Partial<Setting['emailConfig']>): Promise<void>;

    // SMS Config operations
    getSmsConfig(): Promise<Setting['smsConfig']>;
    updateSmsConfig(config: Partial<Setting['smsConfig']>): Promise<void>;

    // Google Maps Config operations
    getGoogleMapsConfig(): Promise<Setting['googleMapsConfig']>;
    updateGoogleMapsConfig(config: Partial<Setting['googleMapsConfig']>): Promise<void>;

    // Integrations Config operations
    getIntegrationConfig(): Promise<Setting['integrationsConfig']>;
    updateIntegrationConfig(integrations: Partial<Setting['integrationsConfig']>): Promise<void>;

}

export const SettingStorage = {

     async getSettings(): Promise<Setting> {
        const result = await db.query('SELECT * FROM settings LIMIT 1');
        return result[0];
      },
    
      async updateSettings(updates: Partial<InsertSetting>): Promise<Setting> {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const query = `UPDATE settings SET ${setClause} RETURNING *`;
        const result = await db.query(query, values);
        return result[0];
      },
    
      async getEmailConfig(): Promise<Setting['emailConfig']> {
        const result = await db.query('SELECT email_config FROM settings LIMIT 1');
        return result[0]?.email_config;
      },
    
      async updateEmailConfig(config: Partial<Setting['emailConfig']>): Promise<void> {
        const currentConfig = await this.getEmailConfig();
        const mergedConfig = { ...currentConfig, ...config };
        await db.query('UPDATE settings SET email_config = $1', [mergedConfig]);
      },
    
      async getSmsConfig(): Promise<Setting['smsConfig']> {
        const result = await db.query('SELECT sms_config FROM settings LIMIT 1');
        return result[0]?.sms_config;
      },
    
      async updateSmsConfig(config: Partial<Setting['smsConfig']>): Promise<void> {
        const currentConfig = await this.getSmsConfig();
        const mergedConfig = { ...currentConfig, ...config };
        await db.query('UPDATE settings SET sms_config = $1', [mergedConfig]);
      },
    
      async getGoogleMapsConfig(): Promise<Setting['googleMapsConfig']> {
        const result = await db.query('SELECT sms_config FROM settings LIMIT 1');
        return result[0]?.sms_config;
      },
    
      async updateGoogleMapsConfig(config: Partial<Setting['googleMapsConfig']>): Promise<void> {
        const currentConfig = await this.getGoogleMapsConfig();
        const mergedConfig = { ...currentConfig, ...config };
        await db.query('UPDATE settings SET oogle_maps_config = $1', [mergedConfig]);
      },
    
      async getIntegrationConfig(): Promise<Setting['integrationsConfig']> {
        const result = await db.query('SELECT integrations FROM settings LIMIT 1');
        return result[0]?.integrations;
      },
    
      async updateIntegrationConfig(integrations: Partial<Setting['integrationsConfig']>): Promise<void> {
        const currentIntegrations = await this.getIntegrationConfig();
        const mergedIntegrations = { ...currentIntegrations, ...integrations };
        await db.query('UPDATE settings SET integrations = $1', [mergedIntegrations]);
      }

};