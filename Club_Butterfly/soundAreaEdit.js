let selectedSoundArea;

const soundAreaEditor = document.getElementById("soundAreaEditor");
soundAreaEditor.style.display = "none";

const soundAreaColor = document.getElementById("soundAreaColor");
const soundAreaNameInput = document.getElementById("soundAreaNameInput");
const soundAreaX = document.getElementById("soundAreaX");
const soundAreaY = document.getElementById("soundAreaY");
const soundAreaMinRadius = document.getElementById("soundAreaMinRadius");
const soundAreaMaxRadius = document.getElementById("soundAreaMaxRadius");
const soundAreaLoop = document.getElementById("soundAreaLoop");
const soundAreaDelete = document.getElementById("soundAreaDelete");
const prevSoundArea = document.getElementById("prevSoundArea");
const nextSoundArea = document.getElementById("nextSoundArea");
const closeSoundAreaEditor = document.getElementById("closeSoundAreaEditor");
const hueSlider = document.getElementById('hueSlider');

soundAreaNameInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        // Add your logic here for what should happen when Enter is pressed
        console.log("Enter key pressed in soundAreaNameInput");
        soundAreaNameInput.blur();
    }
});

soundAreaNameInput.addEventListener("blur", function(event) {
    // Add your logic here for what should happen when the input loses focus
    soundAreaNameInput.value = soundAreaNameInput.value.trim();
    if (soundAreaNameInput.value.length > 0) {
        selectedSoundArea.name = soundAreaNameInput.value;
    }
    soundAreaNameInput.value = selectedSoundArea.name;
})

soundAreaX.addEventListener("change", function(event) {
    selectedSoundArea.x = parseFloat(soundAreaX.value);
});

soundAreaY.addEventListener("change", function(event) {
    selectedSoundArea.y = parseFloat(soundAreaY.value);
});

soundAreaMinRadius.addEventListener("change", function(event) {
    selectedSoundArea.minRadius = parseFloat(soundAreaMinRadius.value);
});

soundAreaMaxRadius.addEventListener("change", function(event) {
    selectedSoundArea.maxRadius = parseFloat(soundAreaMaxRadius.value);
});

soundAreaLoop.addEventListener("change", function(event) {
    selectedSoundArea.isLooping = soundAreaLoop.checked;
    selectedSoundArea.player.loop = soundAreaLoop.checked;
});

soundAreaDelete.addEventListener("click", function(event) {
    console.log("Delete sound area");
    if (selectedSoundArea) {
        let confirmDelete = confirm("Are you sure you want to delete this sound area?");
        if (confirmDelete) {
          selectedSoundArea.player.dispose();
          areas.splice(selectedSoundArea.i, 1);
        }
    }
});

// Changing Color
soundAreaColor.addEventListener("click", function(event) {
    hueSlider.style.display = "block";
    hueSlider.focus();
    hueSlider.value = selectedSoundArea.h;
});

// Function to update the color display based on the hue value
function updateColor(hue) {
    const color = `hsl(${hue * 3.6}, 100%, 50%)`; // HSL color format
    soundAreaColor.style.backgroundColor = color; // Apply color to the display box
    selectedSoundArea.h = hue; // Update the sound area color
}

// Event listener for slider change
hueSlider.addEventListener('input', function() {
    updateColor(hueSlider.value); // Update color on slide
});

hueSlider.addEventListener('blur', function() {
    hueSlider.style.display = "none"; // Hide the slider when not in use
});

nextSoundArea.addEventListener("click", function(event) {
    if (selectedSoundArea) {
        selectedSoundArea.i = (selectedSoundArea.i + 1) % areas.length;
        soundAreaEdit(areas[selectedSoundArea.i], selectedSoundArea.i);
    }
});

prevSoundArea.addEventListener("click", function(event) {
    if (selectedSoundArea) {
        selectedSoundArea.i = (selectedSoundArea.i - 1 + areas.length) % areas.length;
        soundAreaEdit(areas[selectedSoundArea.i], selectedSoundArea.i);
    }
});

closeSoundAreaEditor.addEventListener("click", function(event) {
    soundAreaEditor.style.display = "none";
    selectedSoundArea = null;
});

function soundAreaEdit(soundArea, i) {
    soundAreaEditor.style.display = "block";

    selectedSoundArea = soundArea;
    selectedSoundArea.i = i;

    soundAreaNameInput.value = soundArea.name;
    soundAreaColor.style.background = `hsl(${soundArea.h * 3.6}, 100%, 50%)`;
    soundAreaX.value = soundArea.x;
    soundAreaY.value = soundArea.y;
    soundAreaMinRadius.value = soundArea.minRadius;
    soundAreaMaxRadius.value = soundArea.maxRadius;
    soundAreaLoop.checked = soundArea.isLooping;
}
