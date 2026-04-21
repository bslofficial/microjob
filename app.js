import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const auth = getAuth(app);

// অ্যাডমিন ইমেইল চেক
const ADMIN_EMAIL = "bslgaimerofficial@gmail.com";

onAuthStateChanged(auth, (user) => {
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("অ্যাক্সেস ডিনাইড!");
        window.location.href = "index.html"; 
    }
});

// ১. এডমিন থেকে সরাসরি জব পোস্ট
window.adminPostJob = async () => {
    const title = document.getElementById('adm-title').value;
    const desc = document.getElementById('adm-desc').value; // HTML এ এই আইডি যুক্ত করুন
    const url = document.getElementById('adm-url').value;
    const budget = Number(document.getElementById('adm-budget').value);

    if (!title || !budget) return alert("সব তথ্য দিন!");

    try {
        await addDoc(collection(db, "jobs"), {
            title, description: desc, url, budget, status: "active", createdAt: serverTimestamp()
        });
        alert("জব পাবলিশ হয়েছে!");
        location.reload();
    } catch (e) { alert(e.message); }
};

// ২. জব লিস্ট ম্যানেজমেন্ট (পেন্ডিং জবগুলো এপ্রুভ করার অপশনসহ)
onSnapshot(collection(db, "jobs"), (snapshot) => {
    const container = document.getElementById('admin-job-list'); // আপনার admin.html এ এই আইডিটি থাকতে হবে
    if(!container) return;
    container.innerHTML = "";
    snapshot.forEach((docData) => {
        const job = docData.data();
        const div = document.createElement('div');
        div.className = `p-4 border mb-2 rounded-xl ${job.status === 'pending' ? 'bg-yellow-50' : 'bg-white'}`;
        div.innerHTML = `
            <h4 class="font-bold text-sm">${job.title}</h4>
            <p class="text-xs text-gray-500">${job.description || ''}</p>
            <p class="text-xs font-bold text-blue-600">বাজেট: ৳${job.budget} | স্ট্যাটাস: ${job.status}</p>
            <div class="mt-2 flex gap-2">
                ${job.status === 'pending' ? `<button onclick="window.approveJob('${docData.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-[10px]">Approve</button>` : ''}
                <button onclick="window.deleteJob('${docData.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-[10px]">Delete</button>
            </div>`;
        container.appendChild(div);
    });
});

window.approveJob = async (id) => {
    const budget = prompt("এই জবের জন্য বাজেট কত দিবেন?", "1.5");
    if(budget) {
        await updateDoc(doc(db, "jobs", id), { status: "active", budget: Number(budget) });
        alert("জব এপ্রুভ হয়েছে!");
    }
};

window.deleteJob = async (id) => {
    if(confirm("ডিলিট নিশ্চিত?")) await deleteDoc(doc(db, "jobs", id));
};

// ডিপোজিট ও উইথড্র এপ্রুভাল (আপনার আগের কোডের মতো থাকবে)
// ... (আপনার আগের পাঠানো এপ্রুভাল লজিক এখানে থাকবে)
