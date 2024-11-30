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

  createNewSketch();
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    uid = user.uid;
    console.log("userino is signed in", user);
    showLogOutButton(user);
    getSavedSketches();
    enableSaveButton();
  } else {
    console.log("userino is signed out");
    showLoginButtons();
    hideSavedSketches();
    disableSaveButton();
  }
});

function showLogOutButton(user) {
  const userContainer = document.getElementById("userContainer");
  userContainer.style.display = "flex";
  const userName = document.getElementById("userName");
  userName.innerHTML = user.displayName;
  const userPhoto = document.getElementById("userPhoto");
  if (user.photoURL) {
    userPhoto.src = user.photoURL;
    userPhoto.style.display = "inline";
  } else {
    userPhoto.style.display = "none";
  }

  userPhoto.addEventListener("click", function () {
    const logOutPopup = document.getElementById("logOutPopup");
    if (logOutPopup.classList.contains("show")) {
      logOutPopup.classList.remove("show");
    } else {
      logOutPopup.classList.add("show");
    }
  });

  document.getElementById("logOut").addEventListener("click", function () {
    console.log("signing out");
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("signed out");
      })
      .catch((error) => {
        // An error happened.
        console.log("error signing out");
      });
  });

  const loginContainer = document.getElementById("loginContainer");
  loginContainer.style.display = "none";
}

function showLoginButtons() {
  const userContainer = document.getElementById("userContainer");
  userContainer.style.display = "none";

  const loginContainer = document.getElementById("loginContainer");
  loginContainer.style.display = "block";

  document
    .getElementById("signInWithGoogle")
    .addEventListener("click", function (event) {
      signInWithPopup(auth, googleAuthProvider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });
      event.stopPropagation();
    });
}

// Save to DB
const saveButton = document.getElementById("save");
const sketchNameInput = document.getElementById("sketchNameInput");

function disableSaveButton() {
  saveButton.disabled = true;
}

function enableSaveButton() {
  saveButton.disabled = false;
}

saveButton.addEventListener("click", function () {
  const folder = appName + "/" + uid + "/" + sketchName + "/";
  const dbRef = ref(db, folder);
  const areasData = [];

  Promise.all(
    areas.map(async (area) => {
      const file = area.filePath;
      const fileRef = storageRef(storage, folder + file.name);

      await uploadBytes(fileRef, file).then((snapshot) => {
        console.log("Uploaded a file!");
        return getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          area.filePath = downloadURL;
        });
      });

      areasData.push({
        x: area.x,
        y: area.y,
        h: area.h,
        minRadius: area.minRadius,
        maxRadius: area.maxRadius,
        filePath: area.filePath,
        schedulePlay: area.schedulePlay,
        isEditable: area.isEditable,
      });
    })
  ).then(() => {
    set(dbRef, areasData);
  });
});

// Load from All Sketches from DB
function getSavedSketches() {
  const sketchesRef = ref(db, appName + "/" + uid + "/");
  onValue(sketchesRef, (snapshot) => {
    const sketches = snapshot.val();
    if (sketches) {
      showSavedSketches(sketches);
    } else {
      console.log("No sketches found");
    }
  });
}

document.getElementById("openSketch").addEventListener("click", function () {
  const openSketchPopup = document.getElementById("openSketchPopup");
  if (openSketchPopup.classList.contains("show")) {
    openSketchPopup.classList.remove("show");
  } else {
    openSketchPopup.classList.add("show");
  }
});

function showSavedSketches(sketches) {
  const sketchesDivContainer = document.getElementById(
    "savedSketchesContainer"
  );
  sketchesDivContainer.style.display = "block";
  const sketchesDiv = document.getElementById("savedSketches");
  sketchesDiv.innerHTML = "";
  for (const key in sketches) {
    const sketch = sketches[key];
    const sketchDiv = document.createElement("div");
    sketchDiv.innerHTML = key;
    sketchDiv.setAttribute("class", "saved-sketch");
    sketchDiv.addEventListener("click", function () {
      loadSketch(sketch, key);
    });
    sketchesDiv.appendChild(sketchDiv);
  }
}

function hideSavedSketches() {
  const sketchesDivContainer = document.getElementById(
    "savedSketchesContainer"
  );
  sketchesDivContainer.style.display = "none";
}

// Load Sketch from DB
function loadSketch(sketch, key) {
  console.log("load sketch", sketch);
  sketchNameInput.value = key;
  areas = [];
  sketch.forEach((areaData) => {
    console.log(areaData);
    areas.push(
      new soundArea(
        areaData.x,
        areaData.y,
        areaData.h,
        areaData.minRadius,
        areaData.maxRadius,
        areaData.filePath,
        areaData.schedulePlay,
        areaData.isEditable
      )
    );
  });
}

// New Sketch
const newSketchButton = document.getElementById("newSketch");
newSketchButton.addEventListener("click", createNewSketch);

function createNewSketch() {
  areas = [];
  const suggestedName = getSuggestedName();
  updateSketchName(suggestedName);
}

function getSuggestedName() {
  const randomInt1 = Math.floor(Math.random() * 88);
  const randomInt2 = Math.floor(Math.random() * 100);

  return constellationAdjectives[randomInt2] + " " + constellations[randomInt1];
}

function updateSketchName(newSketchName) {
  sketchName = newSketchName;
  const sketchNameP = document.getElementById("sketchName");
  sketchNameP.innerHTML = newSketchName;
}

// Edit Name
let isEditNameMode = false;
const editNameButton = document.getElementById("editName");
editNameButton.addEventListener("click", toggleEditMode);

sketchNameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    toggleEditMode();
  }
});

sketchNameInput.addEventListener("blur", function () {
  toggleEditMode();
});

const sketchNameP = document.getElementById("sketchName");
sketchNameP.addEventListener("dblclick", function () {
  toggleEditMode();
});

function toggleEditMode(e) {
  e.preventDefault();
  isEditNameMode = !isEditNameMode;
  const sketchNameP = document.getElementById("sketchName");

  if (isEditNameMode) {
    sketchNameInput.style.display = "block";
    sketchNameInput.value = sketchName;
    sketchNameInput.focus();
    editNameButton.innerHTML = "✓";
    sketchNameP.style.display = "none";
  } else {
    sketchNameInput.style.display = "none";
    editNameButton.innerHTML = "✎";
    sketchNameP.style.display = "block";
    updateSketchName(sketchNameInput.value);
  }
}

// Info
document.getElementById("info").addEventListener("click", function () {
  const infoPopup = document.getElementById("infoPopup");
  if (infoPopup.classList.contains("show")) {
    infoPopup.classList.remove("show");
  } else {
    infoPopup.classList.add("show");
  }
});
