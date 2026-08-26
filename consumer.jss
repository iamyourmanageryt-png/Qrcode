import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Hardcoded templates for MVP (You will replace this with AI generation later)
const templates = [
  "Absolutely amazing experience. The staff was incredibly friendly and the service was top-notch. Highly recommend!",
  "Great atmosphere and excellent quality. Everything exceeded my expectations. Will definitely be coming back.",
  "Five stars! Quick service, very clean space, and exactly what I was looking for today."
];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Get QR ID from URL (e.g., domain.com/?id=X9F2A)
  const urlParams = new URLSearchParams(window.location.search);
  const qrId = urlParams.get('id');

  if (!qrId) {
    document.getElementById("loading-state").innerText = "Invalid QR Code.";
    return;
  }

  try {
    // 2. Fetch from Firestore
    const docRef = doc(db, "qrcodes", qrId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      if (data.status === "unassigned") {
        document.getElementById("loading-state").innerText = "This QR code is not yet activated.";
        return;
      }

      // 3. Render UI
      document.getElementById("loading-state").style.display = "none";
      document.getElementById("content-state").style.display = "block";
      document.getElementById("business-name").innerText = data.businessName;

      const container = document.getElementById("templates-container");
      templates.forEach(text => {
        const card = document.createElement("div");
        card.className = "review-card";
        card.innerText = text;
        
        // 4. The "Invisible Copy" Action
        card.addEventListener("click", () => handleReviewClick(text, data.placeId));
        container.appendChild(card);
      });

    } else {
      document.getElementById("loading-state").innerText = "QR Code not found in database.";
    }
  } catch (error) {
    console.error("Error fetching QR data:", error);
    document.getElementById("loading-state").innerText = "Network error. Please try again.";
  }
});

async function handleReviewClick(text, placeId) {
  try {
    // Copy to clipboard
    await navigator.clipboard.writeText(text);
    
    // Show toast animation
    const toast = document.getElementById("success-toast");
    toast.classList.add("active");

    // Redirect to Google after 1.5 seconds
    setTimeout(() => {
      window.location.href = `https://search.google.com/local/writereview?placeid=${placeId}`;
    }, 1500);

  } catch (err) {
    alert("Unable to copy to clipboard. Please select and copy manually.");
  }
}
