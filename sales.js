import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.getElementById("bind-btn").addEventListener("click", async () => {
  const qrId = document.getElementById("qr-id-input").value.trim();
  const bizName = document.getElementById("biz-name-input").value.trim();
  const googleLink = document.getElementById("google-link-input").value.trim();
  const statusMsg = document.getElementById("status-msg");
  const qrContainer = document.getElementById("qrcode-container");
  const qrDrawArea = document.getElementById("qrcode");

  if (!qrId || !bizName || !googleLink) {
    statusMsg.innerText = "Please fill out all fields.";
    statusMsg.style.color = "red";
    return;
  }

  try {
    statusMsg.innerText = "Binding to Firebase...";
    statusMsg.style.color = "black";

    // 1. Save to Firestore
    const docRef = doc(db, "qrcodes", qrId);
    await setDoc(docRef, {
      status: "active",
      businessName: bizName,
      googleLink: googleLink, // Saving the raw link instead of a Place ID
      updatedAt: new Date()
    }, { merge: true });

    statusMsg.innerText = "✅ Successfully Bound!";
    statusMsg.style.color = "green";

    // 2. Generate the visual QR Code
    // Make sure this matches where your index.html is hosted!
    // For testing locally, you can use something like: http://127.0.0.1:5500/?id=
    const redirectUrl = `https://your-production-domain.com/?id=${qrId}`; 
    
    // Clear previous QR code if any
    qrDrawArea.innerHTML = ""; 
    qrContainer.style.display = "flex";

    // Draw new QR code
    new QRCode(qrDrawArea, {
      text: redirectUrl,
      width: 200,
      height: 200,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });

    // Optional: Clear inputs for next entry
    document.getElementById("qr-id-input").value = "";
    document.getElementById("biz-name-input").value = "";
    document.getElementById("google-link-input").value = "";

  } catch (error) {
    console.error("Error writing document: ", error);
    statusMsg.innerText = "❌ Error saving to database.";
    statusMsg.style.color = "red";
  }
});
