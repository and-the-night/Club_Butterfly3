import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
  set,
  push,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getAuth,
  signOut,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getStorage,
  uploadBytes,
  uploadString,
  getDownloadURL,
  ref as storageRef,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

let db, auth, app, user, uid, storage;
let googleAuthProvider;
let appName = "ClubButterfly";

const composition = {
  id: null,
  name,
  areas: [],
}

initFirebase();

function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyA7JqdQTayDT6qlCvzuIHpTPxLqvJQmlJI",
    authDomain: "shared-minds-967a2.firebaseapp.com",
    databaseURL: "https://shared-minds-967a2-default-rtdb.firebaseio.com",
    projectId: "shared-minds-967a2",
    storageBucket: "shared-minds-967a2.firebasestorage.app",
    messagingSenderId: "254122128784",
    appId: "1:254122128784:web:6b5aae86110cb85c472f15",
    measurementId: "G-C5QS5WX9VY",
  };
  app = initializeApp(firebaseConfig);

  db = getDatabase();
  auth = getAuth();
  storage = getStorage();
  setPersistence(auth, browserSessionPersistence);
  googleAuthProvider = new GoogleAuthProvider();
}

function getUrlQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = {};
    for (const [key, value] of params.entries()) {
        if(key === "comp") {
            const data = value.split(";");
            query.user = data[0];
            query.comp = data[1];
            
        }
    }
    return query;
}
  
const queryParams = getUrlQuery();

if (queryParams.user && queryParams.comp) {
    loadComposition(queryParams.user, queryParams.comp);
}

function loadComposition(uid, compId) {
  const compRef = ref(db, appName + "/" + uid + "/" + compId + "/");
  onValue(compRef, (snapshot) => {
    const comp = snapshot.val();

    const compName = document.getElementById("compositionName");
    compName.innerHTML = comp.name;

    const compAuthor = document.getElementById("compositionAuthor");
    compAuthor.innerHTML = comp.author;

    areas = [];
    comp.areas[0].forEach((areaData) => {
      areas.push(
        new soundArea(
          areaData.x,
          areaData.y,
          areaData.h,
          areaData.minRadius,
          areaData.maxRadius,
          areaData.filePath,
          areaData.schedulePlay,
          false,
        )
      );
    });
  });
}