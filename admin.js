import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, increment, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- এডমিন কাজ পাবলিশ ---
document.getElementById('adm-post-btn').onclick = async () => {
    const title = document.getElementById('adm-title').value;
    const url = document.getElementById('adm-url').value;
    const desc = document.getElementById('adm-desc').value;
    const budget = document.getElementById('adm-budget').value;

    if(!title || !budget) return alert("অসম্পূর্ণ তথ্য!");

    try {
        await addDoc(collection(db, "jobs"), {
            title, url, description: desc, budget: Number(budget), status: "active", createdAt: serverTimestamp()
        });
        alert("সফলভাবে পোস্ট হয়েছে!");
        location.reload();
    } catch (e) { alert(e.message); }
};

// --- ডিপোজিট লোড ও এপ্রুভ ---
async function loadDeposits() {
    const list = document.getElementById('pending-deposits');
    const q = query(collection(db, "deposits"), where("status", "==", "pending"));
    const snap = await getDocs(q);
    list.innerHTML = snap.empty ? '<p class="text-xs text-gray-400">নেই</p>' : '';
    snap.forEach(d => {
        const data = d.data();
        list.innerHTML += `
            <div class="p-3 bg-gray-50 rounded-xl text-xs">
                <p>ইউজার: ${data.userEmail}</p>
                <p class="font-bold">টাকা: ৳${data.amount} | Trx: ${data.trx}</p>
                <button onclick="approveDep('${d.id}', '${data.userId}', ${data.amount})" class="bg-green-600 text-white px-3 py-1 rounded mt-2">Approve</button>
            </div>
        `;
    });
}

window.approveDep = async (id, uid, amt) => {
    await updateDoc(doc(db, "users", uid), { balance: increment(amt) });
    await updateDoc(doc(db, "deposits", id), { status: "approved" });
    alert("ডিপোজিট এপ্রুভ হয়েছে!");
    location.reload();
};

// --- ইউজার জব এপ্রুভ ---
async function loadUserJobs() {
    const list = document.getElementById('user-job-requests');
    const q = query(collection(db, "jobs"), where("status", "==", "pending_admin"));
    const snap = await getDocs(q);
    snap.forEach(d => {
        const data = d.data();
        list.innerHTML += `<div class="p-3 bg-orange-50 rounded-xl text-xs">
            <p class="font-bold">${data.title}</p>
            <p>টাকা: ৳${data.budget}</p>
            <button onclick="activateJob('${d.id}')" class="bg-blue-600 text-white px-3 py-1 rounded mt-2">Live Now</button>
        </div>`;
    });
}

window.activateJob = async (id) => {
    await updateDoc(doc(db, "jobs", id), { status: "active" });
    alert("কাজটি লাইভ হয়েছে!");
    location.reload();
};

loadDeposits();
loadUserJobs();
