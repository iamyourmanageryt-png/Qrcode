import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Google Places Autocomplete
let autocomplete;

// We wait for the window to load so the Google Maps script is fully ready
window.addEventListener('load', () => {
  const input = document.getElementById("autocomplete-input");
  
  // Create the autocomplete object
  autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["place_id", "name"],
    // Restricting to India makes the search much faster and more accurate for local B2B sales
    componentRestrictions: { country: "in" } 
  });

  // Listen for the user selecting a place from the dropdown
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    
    if (!place.place_id) {
      alert("Please select a business from the dropdown suggestions.");
      return;
    }

    // Auto-fill the hidden/readonly inputs
    document.getElementById("place-id-input").value = place.place_id;
    document.getElementById("biz-name-input").value = place.name;
  });
});

// The existing Bind button logic
document.getElementById("bind-btn").addEventListener("click", async () => {
  const qrId = document.getElementById("qr-id-input").value.trim();
  const placeId = document.getElementById("place-id-input").value.trim();
  const bizName = document.getElementById("biz-name-input").value.trim();
  const statusMsg = document.getElementById("status-msg");

  if (!qrId || !placeId || !bizName) {
    statusMsg.innerText = "Please ensure a QR ID is entered and a business is selected.";
    statusMsg.style.color = "red";
    return;
  }

  try {
    statusMsg.innerText = "Binding...";
    statusMsg.style.color = "black";

    const docRef = doc(db, "qrcodes", qrId);
    
    await setDoc(docRef, {
      status: "active",
      placeId: placeId,
      businessName: bizName,
      updatedAt: new Date()
    }, { merge: true });

    statusMsg.innerText = "✅ Successfully Bound!";
    statusMsg.style.color = "green";
    
    // Clear form for the next client
    document.getElementById("qr-id-input").value = "";
    document.getElementById("autocomplete-input").value = "";
    document.getElementById("place-id-input").value = "";
    document.getElementById("biz-name-input").value = "";

  } catch (error) {
    console.error("Error writing document: ", error);
    statusMsg.innerText = "❌ Error binding QR Code.";
    statusMsg.style.color = "red";
  }
});
