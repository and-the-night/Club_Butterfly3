if (emptySketch) {
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
          // const minRadius = prompt("Enter the minimum radius:");
          // const maxRadius = prompt("Enter the maximum radius:");

          const dropAreaRect = dropArea.getBoundingClientRect();
          const dropAreaX = dropAreaRect.left + window.scrollX;
          const dropAreaY = dropAreaRect.top + window.scrollY;

          const mouseX = e.clientX;
          const mouseY = e.clientY;

          x = mouseX - dropAreaX;
          y = mouseY - dropAreaY;

          const sound = new soundArea(
            x,
            y,
            random(360),
            40,
            400,
            URL.createObjectURL(file),
            false
          );

          areas.push(sound);
          // You can add further processing here
        } else {
          console.log("Not an audio file:", file);
        }
      });
    }
  });
}
