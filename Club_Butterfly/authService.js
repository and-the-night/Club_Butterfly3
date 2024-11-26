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

let authDiv = document.createElement("div");
// authDiv.style.position = "absolute";
// authDiv.style.top = "10%";
// authDiv.style.left = "85%";
authDiv.style.width = "150px";
//authDiv.style.height = "150px";
authDiv.style.backgroundColor = "lightpink";
authDiv.style.border = "1px solid black";
authDiv.style.padding = "10px";
authDiv.style.zIndex = "3000";
document.body.appendChild(authDiv);

function showLogOutButton(user) {
  authDiv.innerHTML = "";
  let userNameDiv = document.createElement("div");
  if (user.photoURL) {
    let userPic = document.createElement("img");
    userPic.src = user.photoURL;
    userPic.style.width = "50px";
    userPic.style.height = "50px";
    authDiv.appendChild(userPic);
  }
  if (user.displayName) {
    userNameDiv.innerHTML = user.displayName;
  } else {
    userNameDiv.innerHTML = user.email;
  }
  let logOutButton = document.createElement("button");
  authDiv.appendChild(userNameDiv);
  logOutButton.innerHTML = "Log Out";
  logOutButton.setAttribute("id", "logOut");
  logOutButton.setAttribute("class", "authButton");
  authDiv.appendChild(logOutButton);
  document.getElementById("logOut").addEventListener("click", function () {
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
}

function showLoginButtons() {
  authDiv.innerHTML = "";
  let signUpWithGoogleButton = document.createElement("button");
  signUpWithGoogleButton.innerHTML = "Google Login";
  signUpWithGoogleButton.setAttribute("id", "signInWithGoogle");
  signUpWithGoogleButton.setAttribute("class", "authButton");
  authDiv.appendChild(signUpWithGoogleButton);

  authDiv.appendChild(document.createElement("br"));
  authDiv.appendChild(document.createElement("br"));

  let emailDiv = document.createElement("div");
  emailDiv.innerHTML = "Email";
  authDiv.appendChild(emailDiv);

  let emailInput = document.createElement("input");
  emailInput.setAttribute("id", "email");
  emailInput.setAttribute("class", "authInput");
  emailInput.setAttribute("type", "text");
  emailInput.setAttribute("placeholder", "email@email.com");
  authDiv.appendChild(emailInput);

  let passwordInput = document.createElement("input");
  passwordInput.setAttribute("id", "password");
  passwordInput.setAttribute("type", "password");
  passwordInput.setAttribute("class", "authInput");
  passwordInput.setAttribute("placeholder", "password");
  passwordInput.setAttribute("suggest", "current-password");
  passwordInput.setAttribute("autocomplete", "on");
  authDiv.appendChild(passwordInput);

  let signUpWithEmailButton = document.createElement("button");
  signUpWithEmailButton.innerHTML = "Sign Up";
  signUpWithEmailButton.setAttribute("id", "signUpWithEmail");
  signUpWithEmailButton.setAttribute("class", "authButton");
  authDiv.appendChild(signUpWithEmailButton);

  let signInWithEmailButton = document.createElement("button");
  signInWithEmailButton.innerHTML = "Sign In";
  signInWithEmailButton.setAttribute("id", "signInWithEmail");
  signInWithEmailButton.setAttribute("class", "authButton");
  authDiv.appendChild(signInWithEmailButton);

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

  document
    .getElementById("signInWithEmail")
    .addEventListener("click", function (event) {
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
      event.stopPropagation();
    });

  document
    .getElementById("signUpWithEmail")
    .addEventListener("click", function (event) {
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;
          console.log(user);
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
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
    console.log("areasData2", areasData);
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
      console.log("sketch clicked", key);
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
  const randomInt1 = Math.floor(Math.random() * 100);
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

function toggleEditMode() {
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
