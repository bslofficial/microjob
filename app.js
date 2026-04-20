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

document.getElementById('adm-post-btn').onclick = async () => {
    const title = document.getElementById('adm-title').value;
    const desc = document.getElementById('adm-desc').value;
    const budget = document.getElementById('adm-budget').value;

    if (!title || !desc || !budget) {
        alert("টাইটেল, ডেসক্রিপশন এবং বাজেট—সবগুলোই লিখুন!");
        return;
    }

    try {
        await addDoc(collection(db, "jobs"), {
            title: title,
            description: desc,
            budget: Number(budget),
            createdAt: new Date().toISOString() // সহজ সময়ের জন্য
        });
        alert("সফলভাবে পাবলিশ হয়েছে!");
        location.reload();
    } catch (error) {
        alert("এরর: " + error.message);
    }
};
