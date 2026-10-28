/**
 * Nexcrest Insights - Firebase Cloud Firestore Configuration & Real-Time Sync Service
 * Synchronizes users, passwords, targets, and deliverables in real time across all devices.
 */

window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

class FirebaseSyncService {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.listeners = [];
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
          cloudUsers[doc.id.toLowerCase()] = doc.data();
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

  // Save / Update user profile or password in Cloud Firestore
  async saveUser(user) {
    if (!this.isActive() || !user || !user.email) return false;
    try {
      const email = user.email.toLowerCase().trim();
      await this.db.collection('users').doc(email).set({
        ...user,
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
          batch.set(ref, {
            ...u,
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
          cloudTargets.push({ id: doc.id, ...doc.data() });
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

  // Save target to cloud
  async saveTarget(target) {
    if (!this.isActive() || !target || !target.id) return false;
    try {
      await this.db.collection('targets').doc(String(target.id)).set(target, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to save target to Firestore:', err);
      return false;
    }
  }

  // SUBMISSIONS SYNC: Listen to deliverables & proof links across devices
  subscribeSubmissions(onSubmissionsUpdated) {
    if (!this.isActive()) return null;
    try {
      return this.db.collection('submissions').onSnapshot((snapshot) => {
        const cloudSubmissions = [];
        snapshot.forEach((doc) => {
          cloudSubmissions.push({ id: doc.id, ...doc.data() });
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
      await this.db.collection('submissions').doc(String(sub.id)).set(sub, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to save submission to Firestore:', err);
      return false;
    }
  }
}

// Global instance
window.firebaseSync = new FirebaseSyncService();
