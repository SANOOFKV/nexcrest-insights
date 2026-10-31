/**
 * Nexcrest Insights - Firebase Cloud Firestore Configuration & Real-Time Sync Service
 * Synchronizes users, passwords, targets, and deliverables in real time across all devices.
 */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyA155j7eTnmIi7VaUIgDU8dCs3GHYMxyvk",
  authDomain: "nexcrest-insights.firebaseapp.com",
  projectId: "nexcrest-insights",
  storageBucket: "nexcrest-insights.firebasestorage.app",
  messagingSenderId: "484312039866",
  appId: "1:484312039866:web:1007950ed09adbc6079d83",
  measurementId: "G-30XDBKR84M"
};

const LEGACY_PURGED_TARGET_IDS = [
  'gd-1', 'gd-2', 'gd-3', 'gd-4', 'gd-5', 'gd-6', 'gd-7', 'gd-8', 'gd-9', 'gd-10',
  've-1', 've-2', 've-3', 've-4', 've-5', 've-6', 've-7',
  'me-1', 'me-2', 'me-3', 'me-4', 'me-5', 'me-6',
  'sep-1', 'sep-2', 'sep-3', 'sep-4', 'sep-5', 'sep-6', 'sep-7', 'sep-8'
];

class FirebaseSyncService {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.listeners = [];
    this.deletedTargetIds = new Set(LEGACY_PURGED_TARGET_IDS);
    this.deletedSubmissionIds = new Set();
    this.init();
  }

  init() {
    try {
      if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.projectId) {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        this.db = firebase.firestore();
        this.isReady = true;

        // Enable offline persistence for seamless multi-device resilience
        if (typeof this.db.enablePersistence === 'function') {
          this.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
              console.warn('Firestore offline persistence notice:', err.code);
            }
          });
        }
        console.log('⚡ Firebase Firestore Connected: Real-time multi-device sync active.');
      } else {
        console.log('ℹ️ Firebase config pending. Operating in reliable local-storage mode.');
      }
    } catch (err) {
      console.warn('Firebase initialization notice:', err);
    }
  }

  // Check if cloud sync is fully active
  isActive() {
    return this.isReady && this.db !== null;
  }

  // USERS SYNC: Listen to real-time user updates across all devices
  subscribeUsers(onUsersUpdated) {
    if (!this.isActive()) return null;
    try {
      return this.db.collection('users').onSnapshot((snapshot) => {
        const cloudUsers = {};
        snapshot.forEach((doc) => {
          const u = doc.data();
          if (u) {
            delete u.password; // Strip any legacy plaintext password
            cloudUsers[doc.id.toLowerCase()] = u;
          }
        });
        if (Object.keys(cloudUsers).length > 0) {
          onUsersUpdated(cloudUsers);
        }
      }, (err) => {
        console.error('Firestore users subscription error:', err);
      });
    } catch (e) {
      console.error('Failed to subscribe to cloud users:', e);
      return null;
    }
  }

  // Save / Update user profile in Cloud Firestore (Sanitized against plaintext passwords)
  async saveUser(user) {
    if (!this.isActive() || !user || !user.email) return false;
    try {
      const email = user.email.toLowerCase().trim();
      const safeUser = { ...user };
      delete safeUser.password; // Enforce zero plaintext password leak to cloud
      await this.db.collection('users').doc(email).set({
        ...safeUser,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to save user to Cloud Firestore:', err);
      return false;
    }
  }

  // Seed default users to cloud if cloud collection is empty
  async seedUsersIfEmpty(defaultUsers) {
    if (!this.isActive()) return;
    try {
      const snap = await this.db.collection('users').limit(1).get();
      if (snap.empty) {
        const batch = this.db.batch();
        Object.entries(defaultUsers).forEach(([email, u]) => {
          const ref = this.db.collection('users').doc(email.toLowerCase());
          const safeUser = { ...u };
          delete safeUser.password;
          batch.set(ref, {
            ...safeUser,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
        await batch.commit();
        console.log('✅ Seeded default users into Cloud Firestore');
      }
    } catch (err) {
      console.warn('Notice seeding users:', err);
    }
  }

  // TARGETS SYNC: Listen to real-time target changes across devices
  subscribeTargets(onTargetsUpdated) {
    if (!this.isActive()) return null;
    try {
      return this.db.collection('targets').onSnapshot((snapshot) => {
        const cloudTargets = [];
        snapshot.forEach((doc) => {
          // Prevent deleted zombie targets from resurrecting
          if (!this.deletedTargetIds.has(String(doc.id))) {
            cloudTargets.push({ id: doc.id, ...doc.data() });
          }
        });
        if (cloudTargets.length > 0) {
          onTargetsUpdated(cloudTargets);
        }
      }, (err) => {
        console.error('Firestore targets subscription error:', err);
      });
    } catch (e) {
      console.error('Failed to subscribe to cloud targets:', e);
      return null;
    }
  }

  // Seed default targets to cloud if collection is empty
  async seedTargetsIfEmpty(seedTargets) {
    if (!this.isActive() || !Array.isArray(seedTargets)) return;
    try {
      const snap = await this.db.collection('targets').limit(1).get();
      if (snap.empty) {
        const batch = this.db.batch();
        seedTargets.forEach(t => {
          const ref = this.db.collection('targets').doc(String(t.id));
          batch.set(ref, t);
        });
        await batch.commit();
        console.log('✅ Seeded default targets into Cloud Firestore');
      }
    } catch (err) {
      console.warn('Notice seeding targets:', err);
    }
  }

  // Sanitize object so Firestore never receives `undefined` values (which causes Firestore errors)
  _cleanFirestoreData(data) {
    if (!data || typeof data !== 'object') return data;
    const clean = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        clean[key] = data[key];
      }
    });
    return clean;
  }

  // Save target to cloud
  async saveTarget(target) {
    if (!this.isActive() || !target || !target.id) return false;
    try {
      this.deletedTargetIds.delete(String(target.id));
      const cleanData = this._cleanFirestoreData(target);
      await this.db.collection('targets').doc(String(target.id)).set(cleanData, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to save target to Firestore:', err);
      return false;
    }
  }

  // Delete target from cloud with tombstone protection against zombie data
  async deleteTarget(id) {
    if (!this.isActive() || !id) return false;
    try {
      this.deletedTargetIds.add(String(id));
      await this.db.collection('targets').doc(String(id)).delete();
      return true;
    } catch (err) {
      console.error('Failed to delete target from Firestore:', err);
      return false;
    }
  }

  // Batch delete multiple targets from cloud
  async deleteMultipleTargets(targetIds) {
    if (!this.isActive() || !Array.isArray(targetIds) || targetIds.length === 0) return false;
    try {
      targetIds.forEach(id => this.deletedTargetIds.add(String(id)));
      const batch = this.db.batch();
      targetIds.forEach(id => {
        const ref = this.db.collection('targets').doc(String(id));
        batch.delete(ref);
      });
      await batch.commit();
      return true;
    } catch (err) {
      console.error('Failed to batch delete targets from Firestore:', err);
      try {
        await Promise.all(targetIds.map(id => this.deleteTarget(id)));
      } catch (e) {
        console.error('Fallback delete targets error:', e);
      }
      return false;
    }
  }

  // Seed default submissions to cloud (disabled permanently - no demo submissions)
  async seedSubmissionsIfEmpty(seedSubs) {
    return;
  }

  // SUBMISSIONS SYNC: Listen to deliverables & proof links across devices
  subscribeSubmissions(onSubmissionsUpdated) {
    if (!this.isActive()) return null;
    try {
      return this.db.collection('submissions').onSnapshot((snapshot) => {
        const cloudSubmissions = [];
        snapshot.forEach((doc) => {
          if (!this.deletedSubmissionIds.has(String(doc.id))) {
            cloudSubmissions.push({ id: doc.id, ...doc.data() });
          }
        });
        onSubmissionsUpdated(cloudSubmissions);
      }, (err) => {
        console.error('Firestore submissions subscription error:', err);
      });
    } catch (e) {
      console.error('Failed to subscribe to cloud submissions:', e);
      return null;
    }
  }

  // Save deliverable submission to cloud
  async saveSubmission(sub) {
    if (!this.isActive() || !sub || !sub.id) return false;
    try {
      this.deletedSubmissionIds.delete(String(sub.id));
      const cleanData = this._cleanFirestoreData(sub);
      await this.db.collection('submissions').doc(String(sub.id)).set(cleanData, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to save submission to Firestore:', err);
      return false;
    }
  }

  // Delete deliverable submission from cloud
  async deleteSubmission(id) {
    if (!this.isActive() || !id) return false;
    try {
      this.deletedSubmissionIds.add(String(id));
      await this.db.collection('submissions').doc(String(id)).delete();
      return true;
    } catch (err) {
      console.error('Failed to delete submission from Firestore:', err);
      return false;
    }
  }

  // Batch delete multiple submissions from cloud
  async deleteMultipleSubmissions(subIds) {
    if (!this.isActive() || !Array.isArray(subIds) || subIds.length === 0) return false;
    try {
      subIds.forEach(id => this.deletedSubmissionIds.add(String(id)));
      const batch = this.db.batch();
      subIds.forEach(id => {
        const ref = this.db.collection('submissions').doc(String(id));
        batch.delete(ref);
      });
      await batch.commit();
      return true;
    } catch (err) {
      console.error('Failed to batch delete submissions from Firestore:', err);
      try {
        await Promise.all(subIds.map(id => this.deleteSubmission(id)));
      } catch (e) {
        console.error('Fallback delete submissions error:', e);
      }
      return false;
    }
  }

  // MARKETING DAILY ROUTINES SYNC
  subscribeMarketingDailyRoutines(onUpdated) {
    if (!this.isActive()) return null;
    try {
      return this.db.collection('marketing_daily_routines').onSnapshot((snapshot) => {
        const routines = [];
        snapshot.forEach((doc) => {
          routines.push({ id: doc.id, ...doc.data() });
        });
        if (typeof onUpdated === 'function') onUpdated(routines);
      }, (err) => {
        console.warn('Firestore marketing daily routines subscription notice:', err);
      });
    } catch (e) {
      console.warn('Failed to subscribe to marketing daily routines:', e);
      return null;
    }
  }

  async saveMarketingDailyRoutine(routine) {
    if (!this.isActive() || !routine || !routine.id) return false;
    try {
      const cleanData = this._cleanFirestoreData(routine);
      await this.db.collection('marketing_daily_routines').doc(String(routine.id)).set(cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn('Failed to save marketing daily routine to Firestore:', err);
      return false;
    }
  }

  // MARKETING WEEKLY ROUTINES SYNC
  subscribeMarketingWeeklyRoutines(onUpdated) {
    if (!this.isActive()) return null;
    try {
      return this.db.collection('marketing_weekly_routines').onSnapshot((snapshot) => {
        const routines = [];
        snapshot.forEach((doc) => {
          routines.push({ id: doc.id, ...doc.data() });
        });
        if (typeof onUpdated === 'function') onUpdated(routines);
      }, (err) => {
        console.warn('Firestore marketing weekly routines subscription notice:', err);
      });
    } catch (e) {
      console.warn('Failed to subscribe to marketing weekly routines:', e);
      return null;
    }
  }

  async saveMarketingWeeklyRoutine(routine) {
    if (!this.isActive() || !routine || !routine.id) return false;
    try {
      const cleanData = this._cleanFirestoreData(routine);
      await this.db.collection('marketing_weekly_routines').doc(String(routine.id)).set(cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn('Failed to save marketing weekly routine to Firestore:', err);
      return false;
    }
  }
}

// Global instance
window.firebaseSync = new FirebaseSyncService();

