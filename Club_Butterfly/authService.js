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

  createNewSketch();
}

onAuthStateChanged(auth, (newUser) => {
  if (newUser) {
    user = newUser;
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    uid = user.uid;
    console.log("userino is signed in", user);
    showLogOutButton(user);
    getSavedSketches();
    enableUserButtons();
  } else {
    user = undefined;
    console.log("userino is signed out");
    showLoginButtons();
    hideSavedSketches();
    disableUserButtons();
  }
});

function getUrlQuery() {
  const params = new URLSearchParams(window.location.search);
  const query = {};
  for (const [key, value] of params.entries()) {
    query[key] = value;
  }
  return query;
}

const queryParams = getUrlQuery();
console.log("queryParams", queryParams);

if (queryParams.comp) {
}

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

  userPhoto.addEventListener("click", function (e) {
    console.log("click photo");
    e.stopPropagation();
    const logOutPopup = document.getElementById("logOutPopup");
    if (logOutPopup.classList.contains("show")) {
      logOutPopup.classList.remove("show");
    } else {
      closePopups();
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

// Enable\Disable User Buttons
const userButtons = document.getElementsByClassName("user-button");

function disableUserButtons() {
  for (const button of userButtons) {
    button.disabled = true;
  }
}

function enableUserButtons() {
  for (const button of userButtons) {
    button.disabled = false;
  }
}

// Save to DB
const saveButton = document.getElementById("save");
saveButton.addEventListener("click", function () {
  const folder = appName + "/" + uid + "/";
  const dbRef = ref(db, folder);
  const areasData = [];

  Promise.all(
    areas.map(async (area) => {
      console.log("area1", area);
      if(area.file) {
        const file = area.file;
        const fileRef = storageRef(storage, folder + file.name);
  
        await uploadBytes(fileRef, file).then((snapshot) => {
          console.log("Uploaded a file!");
          return getDownloadURL(snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            area.filePath = downloadURL;
          });
        });

        area.file = null;
      }

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
  
      return areasData;
    })
  ).then((areasData) => {
    if(composition.id) { 
      console.log("updating existing sketch");
      const folder = appName + "/" + uid + "/" + composition.id + "/";
      const dbRef = ref(db, folder);

      update(dbRef, { areas: areasData });

    } else {
      console.log("saving new sketch");
      const newComposition = {
        name: sketchName,
        areas: areasData,
      };

      const newRef = push(dbRef, newComposition);
      composition.id = newRef.key;
    }

  });

  isDirty = false;
});

// Load from All Sketches from DB
function getSavedSketches() {
  const sketchesRef = ref(db, appName + "/" + uid + "/");
  onValue(sketchesRef, (snapshot) => {
    const sketches = snapshot.val();
    console.log("sketches", sketches);
    if (sketches) {
      showSavedSketches(sketches);
    } else {
      showMoSketches();
    }
  });
}

document.getElementById("openSketch").addEventListener("click", function (e) {
  e.stopPropagation();
  const openSketchPopup = document.getElementById("openSketchPopup");
  if (openSketchPopup.classList.contains("show")) {
    openSketchPopup.classList.remove("show");
  } else {
    closePopups();
    openSketchPopup.classList.add("show");
  }
});

const sketchesDivContainer = document.getElementById(
  "savedSketchesContainer"
);

const noSavedSketches = document.getElementById(
  "noSavedSketches"
);

function showSavedSketches(sketches) {
  sketchesDivContainer.style.display = "block";
  noSavedSketches.style.display = "none";
  const sketchesDiv = document.getElementById("savedSketches");
  sketchesDiv.innerHTML = "";
  for (const key in sketches) {
    const sketch = sketches[key];
    const sketchDiv = document.createElement("div");
    sketchDiv.innerHTML = sketch.name;
    sketchDiv.setAttribute("class", "saved-sketch");
    sketchDiv.addEventListener("click", function () {
      loadSketch(sketch, key);
    });
    sketchesDiv.appendChild(sketchDiv);

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "delete-button");
    deleteButton.innerHTML = "D";
    deleteButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const userConfirmed = confirm("Are you sure you want to delete this composition?");
      if (userConfirmed) {
      const sketchRef = ref(db, appName + "/" + uid + "/" + key);
      set(sketchRef, null).then(() => {
        console.log("Sketch deleted");
        getSavedSketches();
        createNewSketch();
        closePopups();
      }).catch((error) => {
        console.error("Error deleting sketch:", error);
      });
      }
    });
    sketchDiv.appendChild(deleteButton);
  }
}

function showMoSketches() {
  noSavedSketches.style.display = "block";
}

function hideSavedSketches() {
  const sketchesDivContainer = document.getElementById(
    "savedSketchesContainer"
  );
  sketchesDivContainer.style.display = "none";
}

// Load Sketch from DB
function loadSketch(sketch, key) {
  if(isDirty) {
    const userConfirmed = confirm("Are you sure you want to load a saved composition? Any unsaved changes will be lost.");
    if (!userConfirmed) {
      return;
    }
  }
  resetSketch();

  composition.id = key;
  composition.name = sketch.name;
  composition.areas = sketch.areas;
  
  isDirty = false;

  updateSketchName(sketch.name);
  areas = [];
  sketch.areas[0].forEach((areaData) => {
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
  if(isDirty) {
    const userConfirmed = confirm("Are you sure you want to create a new composition? Any unsaved changes will be lost.");
    if (!userConfirmed) {
      return;
    }
  }
  resetSketch();
  areas = [];
  composition.id = null;
  composition.name = null;
  composition.areas = [];
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

  if(composition.id) {
    const folder = appName + "/" + uid + "/" + composition.id + "/";
    const dbRef = ref(db, folder);

    update(dbRef, { name: newSketchName });
  }
}

// Reset
function resetSketch() {
  stopAudio();
  state = "drag";

  if(listener) {
    const pos = {
      x: canvasWidth / 2,
      y: canvasHeight - 60
    }
    listener.update(pos);
  }
}

// Edit Name
let isEditNameMode = false;
const editNameButton = document.getElementById("editName");
editNameButton.addEventListener("click", toggleEditMode);

const sketchNameInput = document.getElementById("sketchNameInput");

sketchNameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    toggleEditMode(false);
  }
});

sketchNameInput.addEventListener("blur", function () {
  toggleEditMode(false);
});

const sketchNameP = document.getElementById("sketchName");
sketchNameP.addEventListener("dblclick", function () {
  toggleEditMode();
});

function toggleEditMode(enterEditMode) {
  // if (e) e.preventDefault(); WHY?

  if(enterEditMode !== undefined) {
    isEditNameMode = enterEditMode;
  } else {
    isEditNameMode = !isEditNameMode;
  }
  const sketchNameP = document.getElementById("sketchName");

  if (isEditNameMode) {
    sketchNameInput.style.display = "block";
    sketchNameInput.value = sketchName;
    sketchNameInput.focus();
    editNameButton.style.display = "none";
    sketchNameP.style.display = "none";
  } else {
    sketchNameInput.style.display = "none";
    sketchNameP.style.display = "block";
    editNameButton.style.display = "block";
    updateSketchName(sketchNameInput.value);
  }
}

// Info
document.getElementById("info").addEventListener("click", function (e) {
  e.stopPropagation();
  const infoPopup = document.getElementById("infoPopup");
  if (infoPopup.classList.contains("show")) {
    infoPopup.classList.remove("show");
  } else {
    closePopups();
    infoPopup.classList.add("show");
  }
});

// Close all popups
document.body.addEventListener("click", function (event) {
  closePopups();
});

function closePopups() {
  const popups = document.getElementsByClassName("popup");
  for (const popup of popups) {
    if (popup.classList.contains("show")) {
      popup.classList.remove("show");
    }
  }
}
