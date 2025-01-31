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
  