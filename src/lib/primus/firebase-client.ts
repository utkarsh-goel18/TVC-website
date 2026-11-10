"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxK98nmjZmGZthpCYuoDI9GDq-40K_wnI",
  authDomain: "tvc-primus-2026.firebaseapp.com",
  projectId: "tvc-primus-2026",
  storageBucket: "tvc-primus-2026.firebasestorage.app",
  messagingSenderId: "324489169670",
  appId: "1:324489169670:web:8f93b5b2a5aedd5de6ac87",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
