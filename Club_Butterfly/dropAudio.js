if (editableMap) {
  const hues = [
    32,
    86,
    16,
    50,
    10,
    0
  ]

  document.addEventListener("DOMContentLoaded", (event) => {
    const dropArea = document.getElementById("drop-area");

    // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener("drop", handleDrop, false);

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function highlight(e) {
      dropArea.classList.add("highlight");
    }

    function unhighlight(e) {
      dropArea.classList.remove("highlight");
    }

    function handleDrop(e) {
      console.log("Drop event:", e);
      const dt = e.dataTransfer;
      const files = dt.files;

      handleFiles(files, e);
    }

    function handleFiles(files, e) {
      [...files].forEach((file) => {
        if (file.type.startsWith("audio/")) {
          // Process the audio file
          console.log("Audio file dropped:", file);

          const dropAreaRect = dropArea.getBoundingClientRect();
          const dropAreaX = dropAreaRect.left + window.scrollX;
          const dropAreaY = dropAreaRect.top + window.scrollY;

          const mouseX = e.clientX;
          const mouseY = e.clientY;

          const x = mouseX - dropAreaX;
          const y = mouseY - dropAreaY;

          const blob = new Blob([file], { type: file.type });
          const url = URL.createObjectURL(blob);
          console.log("Blob URL:", url);

          isDirty = true;

          hueIndex = areas.length % 6;
          const hue = hues[hueIndex];

          console.log("file", file);

          const sound = new soundArea(
            x,
            y,
            hue,
            40,
            200,
            url,
            false,
            true,
            file,
            false,
          );

            areas.push(sound);

            stopAudio();
        } else {
          showMessage("Not an audio file");
          console.log("Not an audio file:", file);
        }
      });
    }
  });
}

// Messages
function showMessage(msgText) {
  const message = document.createElement("div");
  message.classList.add("message-popup");
  message.innerText = msgText;
  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 2000);
}