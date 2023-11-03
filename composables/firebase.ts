import { defineStore } from 'pinia'
import { ref as Ref } from 'vue'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { doc, getFirestore } from 'firebase/firestore'

export const useFirebaseStore = defineStore('firebaseStore', () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDdfFJxVYI764viosQSQuawubCq4Mtg4Rs',
    authDomain: 'ishadistributors-9627a.firebaseapp.com',
    projectId: 'ishadistributors-9627a',
    storageBucket: 'ishadistributors-9627a.appspot.com',
    messagingSenderId: '410959588304',
    appId: '1:410959588304:web:4af373ee95d6e5782d27d5',
    measurementId: 'G-SZY0RHRVB1',
  }

  const app = initializeApp(firebaseConfig)
  const firestoreDB = getFirestore(app)
  const db = doc(firestoreDB, 'distributions', 'isha_maravattam')
  return {
    db,
    firestoreDB,
  }
})
