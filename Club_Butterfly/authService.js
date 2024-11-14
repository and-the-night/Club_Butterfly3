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

let db, auth, app, user, uid;
let googleAuthProvider;
let appName = "ClubButterfly";
initFirebase();

function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyA7JqdQTayDT6qlCvzuIHpTPxLqvJQmlJI",
    authDomain: "shared-minds-967a2.firebaseapp.com",
    projectId: "shared-minds-967a2",
    storageBucket: "shared-minds-967a2.appspot.com",
    messagingSenderId: "254122128784",
    appId: "1:254122128784:web:6b5aae86110cb85c472f15",
    measurementId: "G-C5QS5WX9VY",
  };
  app = initializeApp(firebaseConfig);

  db = getDatabase();
  auth = getAuth();
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
const sketchNameInput = document.getElementById("sketchName");

function disableSaveButton() {
  saveButton.disabled = true;
}

function enableSaveButton() {
  saveButton.disabled = false;
}

saveButton.addEventListener("click", function () {
  const sketchName = sketchNameInput.value;
  let folder = appName + "/" + uid + "/" + sketchName + "/";
  const dbRef = ref(db, folder);
  const areasData = [];
  areas.forEach((area) => {
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
  });
  set(dbRef, areasData);
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
  getSuggestedName().then((name) => {
    sketchNameInput.value = name;
  });
}

async function getSuggestedName() {
  const replicateProxyUrl =
    "https://replicate-api-proxy.glitch.me/create_n_get/";
  let prompt =
    "Return random adjective which is not 'vibrant' followed by a random noun";
  document.body.style.cursor = "progress";
  const data = {
    //mistral "cf18decbf51c27fed6bbdc3492312c1c903222a56e3fe9ca02d6cbe5198afc10",
    //llama  "2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48"
    //"version": "2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48",
    modelURL:
      "https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions",
    input: {
      prompt: prompt,
      max_tokens: 100,
      max_length: 100,
    },
  };
  console.log("Making a Fetch Request", data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  };
  const raw_response = await fetch(replicateProxyUrl, options);
  //turn it into json
  const json_response = await raw_response.json();
  document.body.style.cursor = "auto";
  let textResponse = json_response.output
    .join("")
    .trim()
    .split("\n")[2]
    .replaceAll("*", "");

  return textResponse;
}
