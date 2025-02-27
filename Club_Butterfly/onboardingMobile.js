const onboardingMobilePopup = document.getElementById("onboardingMobilePopup");
const onboardingMobileTitle = document.getElementById("onboardingMobileTitle");
const onboardingMobileText = document.getElementById("onboardingMobileText");
const onboardingMobileNextButton = document.getElementById("onboardingMobileNextButton");

let onboardingStep = 0;

function updatePopup() {
    if(state == "mobile") {
        // Mobile Onboarding
        switch (onboardingStep) {
            case 0:
                onboardingMobileTitle.textContent = "Welcome to Club Butterfly!";
                onboardingMobileText.textContent = "An immersive audio experience you can enjoy anywhere.";
            break;
            case 1:
                onboardingMobileTitle.textContent = "Step 1/3";
                onboardingMobileText.textContent = "First, connect headphones or earbuds to your device.";
            break;
            case 2:
                onboardingMobileTitle.textContent = "Step 2/3";
                onboardingMobileText.textContent = "Now face the room you are in with space in front of you, holding your device in front of you.";
            break;
            case 3:
                onboardingMobileTitle.textContent = "Step 3/3";
                onboardingMobileText.textContent = "After closing this popup, press the play button, allow detection and start walking around the room.";
                onboardingMobileNextButton.textContent = "Close";
                break;
            case 4:
            onboardingMobilePopup.style.display = "none";
            break;
        }
    } else {
        // Desktop Onboarding
        switch (onboardingStep) {
            case 0:
                onboardingMobileTitle.textContent = "Welcome to Club Butterfly!";
                onboardingMobileText.textContent = "A non-linear music experience.";
            break;
            case 1:
                onboardingMobileTitle.textContent = "Step 1/3";
                onboardingMobileText.textContent = "Press the play button to start the experience.";
            break;
            case 2:
                onboardingMobileTitle.textContent = "Step 2/3";
                onboardingMobileText.textContent = "Drag the butterfly around the screen to change the music.";
            break;
            case 3:
                onboardingMobileTitle.textContent = "Step 3/3";
                onboardingMobileText.textContent = "Press the 'Wander' button to let the butterfly fly around the screen.";
                onboardingMobileNextButton.textContent = "Close";
                break;
            case 4:
            onboardingMobilePopup.style.display = "none";
            break;
        }
    }
}

updatePopup();

onboardingMobileNextButton.addEventListener("click", () => {
    onboardingStep++;
    updatePopup();
})