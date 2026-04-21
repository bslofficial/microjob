import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const ADMIN_EMAIL = "bslgaimerofficial@gmail.com";

// --- ১. লগইন কন্ট্রোল ---
onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
        loadData();
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('admin-view').classList.add('hidden');
        if (user) signOut(auth);
    }
});

window.adminLogin = () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    if (email !== ADMIN_EMAIL) return alert("আপনি অ্যাডমিন নন!");
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল তথ্য: " + e.message));
};

window.adminLogout = () => signOut(auth).then(() => location.reload());

// --- ২. জব পাবলিশ ফাংশন ---
window.adminPostJob = async () => {
    const title = document.getElementById('adm-title').value;
    const desc = document.getElementById('adm-desc').value;
    const url = document.getElementById('adm-url').value;
    const budget = Number(document.getElementById('adm-budget').value);

    if (!title || !budget) return alert("টাইটেল এবং বাজেট অবশ্যই দিতে হবে!");

    try {
        await addDoc(collection(db, "jobs"), {
            title, description: desc, url, budget, status: "active", createdAt: serverTimestamp()
        });
        alert("জব সফলভাবে পাবলিশ হয়েছে!");
        location.reload();
    } catch (e) { alert("Error: " + e.message); }
};

// --- ৩. ইউজারকে মেসেজ পাঠানোর ফাংশন (নতুন) ---
window.sendUserMessage = async () => {
    const targetEmail = document.getElementById('msg-target-email').value;
    const message = document.getElementById('msg-text').value;

    if (!message) return alert("মেসেজটি লিখুন!");

    try {
        await addDoc(collection(db, "notifications"), {
            targetEmail: targetEmail || "all", // খালি থাকলে সবার জন্য
            message: message,
            sender: "Admin",
            time: serverTimestamp(),
            isRead: false
        });
        alert("মেসেজটি সফলভাবে পাঠানো হয়েছে!");
        document.getElementById('msg-text').value = "";
    } catch (e) { alert("মেসেজ পাঠাতে সমস্যা হয়েছে: " + e.message); }
};

// --- ৪. ডাটা লোড ও ম্যানেজমেন্ট ---
function loadData() {
    // জব লিস্ট লোড ও ডিলিট
    onSnapshot(collection(db, "jobs"), (snap) => {
        const list = document.getElementById('admin-job-list');
        list.innerHTML = "";
        if (snap.empty) list.innerHTML = "<p class='text-center text-gray-400'>কোনো জব নেই</p>";
        
        snap.forEach(d => {
            const j = d.data();
            list.innerHTML += `
                <div class="flex justify-between items-center p-4 bg-gray-50 border rounded-2xl mb-2">
                    <div class="text-left">
                        <p class="font-bold text-sm text-gray-800">${j.title}</p>
                        <p class="text-[10px] text-gray-500">${j.description || 'বিবরণ নেই'}</p>
                        <p class="text-[10px] text-blue-600 font-bold">বাজেট: ৳${j.budget}</p>
                    </div>
                    <button onclick="window.deleteJob('${d.id}')" class="text-red-500 p-2 hover:bg-red-100 rounded-full transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
        });
    });

    // ইউজার লিস্ট লোড
    onSnapshot(collection(db, "users"), (snap) => {
        const table = document.getElementById('user-table-body');
        table.innerHTML = "";
        snap.forEach(u => {
            const user = u.data();
            table.innerHTML += `
                <tr class="border-b text-xs">
                    <td class="py-4 font-medium">${user.email}</td>
                    <td class="py-4 font-bold text-green-600">৳${(user.balance || 0).toFixed(2)}</td>
                    <td class="py-4">
                        <button onclick="window.deleteUser('${u.id}')" class="text-red-500 hover:underline">Delete</button>
                    </td>
                </tr>`;
        });
    });
}

// ডিলিট অপারেশন
window.deleteJob = async (id) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই জবটি ডিলিট করতে চান?")) {
        try { await deleteDoc(doc(db, "jobs", id)); } catch (e) { alert(e.message); }
    }
};

window.deleteUser = async (id) => {
    if (confirm("এই ইউজারকে কি ডিলিট করতে চান?")) {
        try { await deleteDoc(doc(db, "users", id)); } catch (e) { alert(e.message); }
    }
};
