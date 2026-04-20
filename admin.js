import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyANRqR887AfhoW4GxInZHH9J3YYWCfnjs0",
    authDomain: "microjobs-b9d90.firebaseapp.com",
    projectId: "microjobs-b9d90",
    storageBucket: "microjobs-b9d90.firebasestorage.app",
    messagingSenderId: "1006928193385",
    appId: "1:1006928193385:web:d4b5cc1911abda6ff53ff8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById('job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const title = document.getElementById('job-title').value;
    const budget = document.getElementById('job-budget').value;

    btn.disabled = true;
    btn.innerText = "Publishing...";

    try {
        await addDoc(collection(db, "jobs"), {
            title: title,
            budget: Number(budget),
            createdAt: new Date()
        });
        alert("Job posted successfully!");
        window.location.href = "index.html"; // পোস্ট হওয়ার পর হোমপেজে নিয়ে যাবে
    } catch (error) {
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.innerText = "Publish Job";
    }
});
