import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// ১. অথেন্টিকেশন চেক
onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
        loadData();
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('admin-view').classList.add('hidden');
        if(user) signOut(auth); 
    }
});

// লগইন ফাংশন
window.adminLogin = () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    if(email !== ADMIN_EMAIL) return alert("Unauthorized Access!");
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};

// লগআউট
window.adminLogout = () => signOut(auth).then(() => location.reload());

// ২. জব পাবলিশ
window.adminPostJob = async () => {
    const title = document.getElementById('adm-title').value;
    const desc = document.getElementById('adm-desc').value;
    const url = document.getElementById('adm-url').value;
    const budget = Number(document.getElementById('adm-budget').value);

    if (!title || !budget) return alert("Title and Budget are required!");

    try {
        await addDoc(collection(db, "jobs"), {
            title, description: desc, url, budget, status: "active", createdAt: serverTimestamp()
        });
        alert("জব পাবলিশ হয়েছে!");
    } catch (e) { alert(e.message); }
};

// ৩. ডাটা লোড ফাংশন
function loadData() {
    // জব লিস্ট ও ডিলিট
    onSnapshot(collection(db, "jobs"), (snap) => {
        const list = document.getElementById('admin-job-list');
        list.innerHTML = "";
        snap.forEach(d => {
            const j = d.data();
            list.innerHTML += `
                <div class="flex justify-between items-center p-4 bg-gray-50 border rounded-2xl">
                    <div>
                        <p class="font-bold text-sm">${j.title}</p>
                        <p class="text-[10px] text-gray-500">${j.description || ''}</p>
                    </div>
                    <button onclick="window.deleteJob('${d.id}')" class="text-red-500 p-2"><i class="fas fa-trash"></i></button>
                </div>`;
        });
    });

    // ইউজার লিস্ট
    onSnapshot(collection(db, "users"), (snap) => {
        const table = document.getElementById('user-table-body');
        table.innerHTML = "";
        snap.forEach(u => {
            const user = u.data();
            table.innerHTML += `
                <tr class="border-b">
                    <td class="py-3">${user.email}</td>
                    <td class="py-3">৳${user.balance.toFixed(2)}</td>
                    <td class="py-3"><button onclick="window.deleteUser('${u.id}')" class="text-red-500"><i class="fas fa-trash"></i></button></td>
                </tr>`;
        });
    });
}

// ডিলিট ফাংশনসমূহ
window.deleteJob = async (id) => { if(confirm("Delete Job?")) await deleteDoc(doc(db, "jobs", id)); };
window.deleteUser = async (id) => { if(confirm("Delete User?")) await deleteDoc(doc(db, "users", id)); };
