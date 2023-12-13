import { defineStore } from 'pinia'
import { ref as Ref } from 'vue'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { doc, getFirestore } from 'firebase/firestore'

export const useFirebaseStore = defineStore('firebaseStore', () => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: 'AIzaSyDdfFJxVYI764viosQSQuawubCq4Mtg4Rs',
    authDomain: 'ishadistributors-9627a.firebaseapp.com',
    projectId: 'ishadistributors-9627a',
    storageBucket: 'ishadistributors-9627a.appspot.com',
    messagingSenderId: '410959588304',
    appId: '1:410959588304:web:4af373ee95d6e5782d27d5',
    measurementId: 'G-SZY0RHRVB1',
  }

  console.log(config.public.distribution)

  const app = initializeApp(firebaseConfig)
  const firestoreDB = getFirestore(app)
  const db = doc(firestoreDB, 'distributions', config.public.distribution)

  const auth = getAuth(app)

  return {
    auth,
    db,
    firestoreDB,
  }
})
