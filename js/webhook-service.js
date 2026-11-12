/**
 * Nexcrest Insights - Multi-Channel Webhook Alerts & Real-Time Push Notification Engine
 * Version: v103
 * 
 * Supports instant dispatches to:
 * - Slack Incoming Webhooks (Block Kit Cards)
 * - Discord Webhooks (Rich Embed Cards)
 * - Universal JSON Endpoints (WhatsApp Cloud API / Zapier / Make.com / n8n / Custom)
 * - Native Browser HTML5 Desktop & Mobile Push Notifications
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'nexcrest_webhook_config_v2';

  const DEFAULT_CONFIG = {
    enabled: false,
    webhookUrl: '',
    channelName: '#nexcrest-approvals',
    browserPushEnabled: false,
    events: {
      submit: true,
      approve: true,
      reject: true,
      assign: false
    }
  };

  class WebhookAlertService {
    constructor() {
      this.config = this.loadConfig();
      this.initCloudSync();
    }

    loadConfig() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...DEFAULT_CONFIG,
            ...parsed,
            events: { ...DEFAULT_CONFIG.events, ...(parsed.events || {}) }
          };
        }
      } catch (e) {
        console.warn('Webhook config read error:', e);
      }
      return { ...DEFAULT_CONFIG };
    }

    saveConfig(newConfig) {
      this.config = {
        ...this.config,
        ...newConfig,
        events: { ...this.config.events, ...((newConfig && newConfig.events) || {}) }
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.error('Failed to store webhook config:', e);
      }
      this.syncToCloud();
      return this.config;
    }

    detectProvider(url = '') {
      const u = (url || this.config.webhookUrl || '').toLowerCase();
      if (u.includes('slack.com')) return 'slack';
      if (u.includes('discord.com') || u.includes('discordapp.com')) return 'discord';
      if (u.includes('whatsapp') || u.includes('wa.me')) return 'whatsapp';
      return 'universal';
    }

    // Connect to Cloud Firestore settings collection for cross-device notification settings
    initCloudSync() {
      if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
        try {
          const db = window.firebaseSync.db;
          db.collection('settings').doc('notifications').onSnapshot((doc) => {
            if (doc.exists) {
              const data = doc.data();
              if (data && data.webhookUrl && !this.config.webhookUrl) {
                this.config = { ...this.config, ...data };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
              }
            }
          }, (err) => {
            console.warn('Notification settings cloud listener notice:', err);
          });
        } catch (e) {
          console.warn('Cloud sync init error for webhooks:', e);
        }
      }
    }

    async syncToCloud() {
      if (typeof window !== 'undefined' && window.firebaseSync && window.firebaseSync.isActive()) {
        try {
          const db = window.firebaseSync.db;
          await db.collection('settings').doc('notifications').set({
            ...this.config,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('Failed to sync notification settings to cloud:', e);
        }
      }
    }

    // Request native browser desktop/mobile notification permission
    async requestBrowserPermission() {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
      }
      try {
        const permission = await Notification.requestPermission();
        this.saveConfig({ browserPushEnabled: permission === 'granted' });
        return permission;
      } catch (e) {
        console.warn('Notification permission error:', e);
        return 'denied';
      }
    }

    sendBrowserPush(title, body, icon = 'assets/nexcrest_icon.png') {
      if (!this.config.browserPushEnabled) return;
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      try {
        const notif = new Notification(title, {
          body,
          icon,
          badge: 'assets/nexcrest_icon.png',
          tag: 'nexcrest-alert'
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('Browser push display error:', e);
      }
    }

    // Build platform-optimized payload
    buildPayload(eventType, data) {
      const provider = this.detectProvider();
      const appUrl = (typeof window !== 'undefined' && window.location.origin) ? window.location.href : 'https://sanoofkv.github.io/nexcrest-insights/';
      const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

      // SLACK BLOCK KIT FORMAT
      if (provider === 'slack') {
        if (eventType === 'deliverable_submitted') {
          return {
            text: `🔔 New Deliverable Submitted: ${data.title} (${data.assigneeName})`,
            blocks: [
              {
                type: "header",
                text: { type: "plain_text", text: "🔔 New Deliverable Submitted for Review", emoji: true }
              },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: `*Task:* ${data.title}` },
                  { type: "mrkdwn", text: `*Assignee:* ${data.assigneeName} (${data.assigneeRole || 'Team Member'})` },
                  { type: "mrkdwn", text: `*Cycle:* ${data.month || 'Current'}` },
                  { type: "mrkdwn", text: `*Submitted At:* ${timestamp}` }
                ]
              },
              {
                type: "actions",
                elements: [
                  ...(data.proofUrl ? [{
                    type: "button",
                    text: { type: "plain_text", text: "🔗 View Proof Asset", emoji: true },
                    url: data.proofUrl,
                    style: "primary"
                  }] : []),
                  {
                    type: "button",
                    text: { type: "plain_text", text: "⚡ Open Nexcrest Command Center", emoji: true },
                    url: appUrl
                  }
                ]
              }
            ]
          };
        }

        if (eventType === 'deliverable_approved') {
          return {
            text: `✅ Deliverable Approved: ${data.title} (${data.assigneeName})`,
            blocks: [
              {
                type: "header",
                text: { type: "plain_text", text: "✅ Deliverable Approved & Marked Delivered", emoji: true }
              },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: `*Task:* ${data.title}` },
                  { type: "mrkdwn", text: `*Member:* ${data.assigneeName}` },
                  { type: "mrkdwn", text: `*Approved By:* ${data.reviewerName || 'Marketing Manager'}` },
                  { type: "mrkdwn", text: `*Status:* *100% Completed*` }
                ]
              }
            ]
          };
        }

        if (eventType === 'deliverable_rejected') {
          return {
            text: `⚠️ Deliverable Revision Required: ${data.title} (${data.assigneeName})`,
            blocks: [
              {
                type: "header",
                text: { type: "plain_text", text: "⚠️ Deliverable Requires Revision", emoji: true }
              },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: `*Task:* ${data.title}` },
                  { type: "mrkdwn", text: `*Member:* ${data.assigneeName}` },
                  { type: "mrkdwn", text: `*Manager Feedback:* ${data.feedback || 'Please review notes and update assets.'}` }
                ]
              }
            ]
          };
        }

        // Test Ping
        return {
          text: "🚀 Nexcrest Insights Alert Engine: Webhook Connected Successfully!",
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: "🚀 Nexcrest Insights Alert Connected!", emoji: true }
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: `Real-time webhook notifications are active. Target channel: *${this.config.channelName}*.\n_Timestamp: ${timestamp}_` }
            }
          ]
        };
      }

      // DISCORD RICH EMBED FORMAT
      if (provider === 'discord') {
        let color = 35685; // Brand Teal #008BA5
        let title = "Nexcrest Notification";
        let desc = "";

        if (eventType === 'deliverable_submitted') {
          color = 35685;
          title = "🔔 New Deliverable Submitted for Review";
          desc = `**Task:** ${data.title}\n**Member:** ${data.assigneeName} (${data.assigneeRole || 'Team Member'})\n**Cycle:** ${data.month || 'Current'}\n${data.proofUrl ? `**Asset:** [Click to View Proof](${data.proofUrl})` : ''}`;
        } else if (eventType === 'deliverable_approved') {
          color = 2278750; // Green #22C55E
          title = "✅ Deliverable Approved";
          desc = `**Task:** ${data.title}\n**Member:** ${data.assigneeName}\n**Reviewed by:** ${data.reviewerName || 'Marketing Manager'}`;
        } else if (eventType === 'deliverable_rejected') {
          color = 16098859; // Amber #F59E0B
          title = "⚠️ Revision Requested";
          desc = `**Task:** ${data.title}\n**Member:** ${data.assigneeName}\n**Notes:** ${data.feedback || 'Revision needed.'}`;
        } else {
          title = "🚀 Nexcrest Insights Webhook Test";
          desc = `Connection verified successfully at ${timestamp}.`;
        }

        return {
          username: "Nexcrest Alerts",
          avatar_url: "https://sanoofkv.github.io/nexcrest-insights/assets/nexcrest_icon.png",
          embeds: [
            {
              title,
              description: desc,
              color,
              footer: { text: "Nexcrest Insights • Operations Command Center" },
              timestamp: new Date().toISOString()
            }
          ]
        };
      }

      // UNIVERSAL / WHATSAPP / ZAPIER / MAKE JSON FORMAT
      return {
        app: "Nexcrest Insights",
        event: eventType,
        timestamp: new Date().toISOString(),
        channel: this.config.channelName,
        payload: data
      };
    }

    // Core Dispatch Engine
    async dispatch(eventType, data = {}) {
      if (!this.config.enabled || !this.config.webhookUrl) {
        return { success: false, reason: 'Webhook disabled or no URL configured' };
      }

      // Check if event toggle is enabled
      const eventKeyMap = {
        deliverable_submitted: 'submit',
        deliverable_approved: 'approve',
        deliverable_rejected: 'reject'
      };
      const key = eventKeyMap[eventType];
      if (key && this.config.events[key] === false) {
        return { success: false, reason: `Event ${eventType} is disabled in preferences` };
      }

      // Also trigger browser push banner
      if (eventType === 'deliverable_submitted') {
        this.sendBrowserPush('🔔 Deliverable Submitted', `${data.assigneeName} submitted "${data.title}" for review.`);
      } else if (eventType === 'deliverable_approved') {
        this.sendBrowserPush('✅ Deliverable Approved', `"${data.title}" was approved by Manager.`);
      } else if (eventType === 'deliverable_rejected') {
        this.sendBrowserPush('⚠️ Revision Required', `"${data.title}" needs revision: ${data.feedback || ''}`);
      }

      const bodyPayload = this.buildPayload(eventType, data);

      try {
        const response = await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload)
        });

        if (response.ok || response.status === 200 || response.status === 204) {
          return { success: true };
        }

        // If Slack/Discord returns ok status text
        const text = await response.text();
        return { success: response.ok, status: response.status, responseText: text };
      } catch (err) {
        // Fallback for strict browser CORS webhooks: attempt no-cors mode so notification still reaches destination
        try {
          await fetch(this.config.webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain'
            },
            body: JSON.stringify(bodyPayload)
          });
          return { success: true, mode: 'no-cors' };
        } catch (noCorsErr) {
          console.warn('Webhook dispatch failed:', noCorsErr);
          return { success: false, error: noCorsErr.message };
        }
      }
    }

    // Instant verification ping
    async sendTestPing() {
      if (!this.config.webhookUrl) {
        return { success: false, reason: 'Please enter a valid webhook URL first.' };
      }
      return this.dispatch('test_ping', {
        title: 'System Health Verification',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Expose singleton to global scope
  window.webhookAlerts = new WebhookAlertService();

})(typeof window !== 'undefined' ? window : this);
