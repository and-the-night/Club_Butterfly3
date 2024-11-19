if (editableMap) {
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

          if (!splitAudio) {
            const dropAreaRect = dropArea.getBoundingClientRect();
            const dropAreaX = dropAreaRect.left + window.scrollX;
            const dropAreaY = dropAreaRect.top + window.scrollY;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const x = mouseX - dropAreaX;
            const y = mouseY - dropAreaY;

            const hue = floor(random(100));

            const sound = new soundArea(
              x,
              y,
              hue,
              40,
              200,
              URL.createObjectURL(file),
              false,
              true
            );

            areas.push(sound);
          } else {
            splitAudioFile(file);
          }
        } else {
          console.log("Not an audio file:", file);
        }
      });
    }
  });
}

async function splitAudioFile(file) {
  const replicateProxy = "https://replicate-api-proxy.glitch.me";
  console.log("Splitting audio file:", file);

  let base64data;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    base64data = reader.result.split(",")[1];
    console.log("Base64 data:", base64data);
    postData.input.audio = base64data;
  };
  await new Promise((resolve) => (reader.onloadend = resolve));

  let postData = {
    fieldToConvertBase64ToURL: "audio",
    fileFormat: "wav",
    version: "25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953",
    input: {
      audio: base64data,
    },
  };

  console.log("Post data:", postData);

  let url = replicateProxy + "/create_n_get";
  const options = {
    headers: {
      "Content-Type": `application/json`,
      "Access-Control-Allow-Origin": "*",
      mode: "no-cors",
    },
    method: "POST",
    body: JSON.stringify(postData), //p)
  };
  console.log("Asking for Picture ", url);
  const response = await fetch(url, options);
  console.log("Response", response);
  const result = await response.json();
  console.log(result.output[0]);
}
