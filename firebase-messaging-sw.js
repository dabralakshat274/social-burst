// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Replace with the SAME firebase config used in the page
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAArwMTBKD5xxssgJIF89xfFMAuVmh4tx4",
  authDomain: "social-burst-463916.firebaseapp.com",
  projectId: "social-burst-463916",
  storageBucket: "social-burst-463916.appspot.com",
  messagingSenderId: "626455805021",
  appId: "1:626455805021:android:59820bd589ce7ca96ea1b4"
};

firebase.initializeApp(FIREBASE_CONFIG);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    // icon: '/firebase-logo.png' // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
