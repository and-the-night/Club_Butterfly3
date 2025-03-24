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
    measurementId: "G-C5QS5WX9VY"
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
    disableShareButton(user)
  } else {
    user = undefined;
    console.log("userino is signed out");
    showLoginButtons();
    hideSavedSketches();
    disableUserButtons();
    disableShareButton();
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

  showSaving();

  Promise.all(
    areas.map(async (area) => {
      if(area.file) {

        const file = area.file;
        const fileRef = storageRef(storage, folder + file.name);
  
        await uploadBytes(fileRef, file).then((snapshot) => {
          console.log("Uploaded a file!");
          return getDownloadURL(snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            area.filePath = downloadURL;
          });
        })

        area.file = null;
      }

      areasData.push({
        name: area.name,
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
    const newComposition = {
      author: user.displayName,
      name: sketchName,
      areas: areasData,
    };
    if(composition.id) { 
      console.log("updating existing sketch");
      const folder = appName + "/" + uid + "/" + composition.id + "/";
      const dbRef = ref(db, folder);

      update(dbRef, newComposition).then(() => {
        showSaved();
        // showMessage("Composition saved successfully!");
      });
    } else {
      console.log("saving new sketch");

      try {
        const newRef = push(dbRef, newComposition);
        composition.id = newRef.key;
        composition.name = newComposition.name;
        showSaved();
    
      } catch (error) {
          console.error("Error adding new composition:", error);
      }
    }

    enableShareButton();

  });
  
  isDirty = false;
});

function showSaving() {
  const saveButton = document.getElementById("save");
  saveButton.innerHTML = "Saving...";
  saveButton.classList.add("saving");
}

function showSaved() {
  const saveButton = document.getElementById("save");
  saveButton.innerHTML = "Saved ✓";
  saveButton.classList.remove("saving");
  setTimeout(() => {
    saveButton.innerHTML = "Save";
  }
  , 2000);
}

// Load from All Sketches from DB
function getSavedSketches() {
  const sketchesRef = ref(db, appName + "/" + uid + "/");
  onValue(sketchesRef, (snapshot) => {
    const sketches = snapshot.val();
    console.log("sketches", sketches);
    if (sketches) {
      showSavedSketches(sketches);
    } else {
      showNoSketches();
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
    // sketchDiv.innerHTML = sketch.name;
    sketchDiv.setAttribute("class", "saved-sketch");
    sketchDiv.addEventListener("click", function () {
      if (composition.id === key) {
        showMessage("This is the current composition.");
      } else if (isDirty) {
        createConfirmationPopup("Are you sure you want to load a saved composition? Any unsaved changes will be lost.", "Load",
          function() {
            loadSketch(sketch, key);
            closePopups();
          });
      } else {
        loadSketch(sketch, key);
      }
    });
    sketchesDiv.appendChild(sketchDiv);

    const sketchName = document.createElement("p");
    sketchName.innerHTML = sketch.name;
    sketchName.setAttribute("class", "sketch-name");
    sketchDiv.appendChild(sketchName);

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "delete-button");
    
    deleteButton.addEventListener("click", function (e) {
      e.stopPropagation();

      createConfirmationPopup("Are you sure you want to delete this composition?", "Delete",
        function() {
          const sketchRef = ref(db, appName + "/" + uid + "/" + key);
          set(sketchRef, null).then(() => {
            console.log("Sketch deleted");
            getSavedSketches();
            createNewSketch();
            closePopups();
          }).catch((error) => {
            console.error("Error deleting sketch:", error);
          });
        });
    });
    sketchDiv.appendChild(deleteButton);

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "images/trash-icon.svg"; // Replace with the actual path to your delete icon
    deleteIcon.alt = "Delete";
    deleteButton.appendChild(deleteIcon);
  }
}

function showNoSketches() {
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
  resetSketch();
  closeSoundAreaEditorFunction();

  composition.id = key;
  composition.name = sketch.name;
  composition.areas = sketch.areas;

  enableShareButton();
  
  isDirty = false;

  updateSketchName(sketch.name);
  areas = [];
  if(sketch.areas) {
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
          areaData.isEditable,
          false,
          null,
          areaData.name,
        )
      );
    });
  }
}

// New Sketch
const newSketchButton = document.getElementById("newSketch");
newSketchButton.addEventListener("click", confirmCreateNewSketch);

function confirmCreateNewSketch() {
  if (isDirty) {
    createConfirmationPopup("Are you sure you want to create a new sketch? Any unsaved changes will be lost.", "OK",
      function() {
        createNewSketch();
        closePopups();
      });
  } else {
    createNewSketch();
  }
}

function createNewSketch() {
  resetSketch();
  closeSoundAreaEditorFunction();
  areas = [];
  composition.id = null;
  composition.name = null;
  composition.areas = [];
  const suggestedName = getSuggestedName();
  updateSketchName(suggestedName);
  disableShareButton(user);
  isDirty = false;
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

// Share
function disableShareButton(user) {
  const shareButton = document.getElementById("share");
  shareButton.disabled = true;

  if(user) {
    shareButton.classList.add("disabled-not-saved");
  } else {
    shareButton.classList.remove("disabled-not-saved");
  }

  shareButton.removeEventListener("click", function (e) {});
};

function enableShareButton() {
  const shareButton = document.getElementById("share");
  shareButton.classList.remove("disabled-not-saved");
  shareButton.disabled = false;

  shareButton.addEventListener("click", function (e) {
    e.stopPropagation();
    const sharePopup = document.getElementById("sharePopup");
    if (sharePopup.classList.contains("show")) {
      sharePopup.classList.remove("show");
    } else {
      closePopups();
      sharePopup.classList.add("show");
    }
  });

  const queryParams = `composition.html?comp=${uid};${composition.id}`;
  const shareUrl = window.location.href.replace("editableMap.html", queryParams);
  document.getElementById("shareLink").href = shareUrl;

  document.getElementById("copyLink").addEventListener("click", function (e) {
    e.stopPropagation();

    showMessage("Link copied to clipboard");
    
    navigator.clipboard.writeText(shareUrl).then(function () {
      console.log("Copied to clipboard");
    });
  });

  document.getElementById("qrCode").src = `https://quickchart.io/qr?text=${shareUrl}&size=200`;
}

// Symmetrize
const symmetrizeButton = document.getElementById("symmetrize");
symmetrizeButton.addEventListener("click", function () {
  symmetrize();
});

function symmetrize() {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = 350;
  const angleStep = (2 * Math.PI) / areas.length;

  if(areas.length == 1) {
    areas[0].x = centerX;
    areas[0].y = centerY;
    areas[0].maxRadius = radius;
    areas[0].minRadius = 50;
    isDirty = true;
    return;
  }

  areas.forEach((area, index) => {
    const angle = index * angleStep - Math.PI / 2;
    area.x = centerX + radius * Math.cos(angle);
    area.y = centerY + radius * Math.sin(angle);
    area.maxRadius = radius + 100;
    area.minRadius = 50;
  });

  isDirty = true;
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

// Blocker 
// checkScreenWidth();
function showBlocker(blockerClass) {
  console.log("showing blocker");
  const blocker = document.getElementById('blocker');
  blocker.style.display = "block";
  blocker.classList.add(blockerClass);
}

function hideBlocker() {
  console.log("hiding blocker");
  const blocker = document.getElementById('blocker');
  blocker.style.display = "none";
}

// Confirmations
function createConfirmationPopup(message, confirmText, onConfirm) {
  const blocker = document.createElement("div");
  blocker.classList.add("message-blocker");
  blocker.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  const popup = document.createElement("div");
  popup.classList.add("confirmation-popup");

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("confirmation-message");
  messageDiv.innerText = message;
  popup.appendChild(messageDiv);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("confirmation-buttons");

  const confirmButton = document.createElement("button");
  confirmButton.classList.add("confirm-button");
  confirmButton.innerText = confirmText || "OK";
  confirmButton.addEventListener("click", () => {
    onConfirm();
    document.body.removeChild(blocker);
  });
  buttonsDiv.appendChild(confirmButton);

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("cancel-button");
  cancelButton.innerText = "Cancel";
  cancelButton.addEventListener("click", () => {
    document.body.removeChild(blocker);
  });
  buttonsDiv.appendChild(cancelButton);

  popup.appendChild(buttonsDiv);
  blocker.appendChild(popup);
  document.body.appendChild(blocker);
}