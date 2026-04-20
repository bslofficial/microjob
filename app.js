import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function fetchJobs() {
    const container = document.getElementById('job-list');
    try {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        container.innerHTML = '';

        snapshot.forEach(doc => {
            const job = doc.data();
            container.innerHTML += `
                <div class="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center border border-gray-200">
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg">${job.title}</h3>
                        <p class="text-blue-600 font-bold">৳${job.budget}</p>
                    </div>
                    <button class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Do Task</button>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = "Error loading jobs.";
    }
}

fetchJobs();
