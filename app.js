// আপনার অরিজিনাল কনফিগারেশন বজায় রাখা হয়েছে
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, limit, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// লিডারবোর্ড লোড করা
function loadLeaderboard() {
    const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(10));
    onSnapshot(q, (snap) => {
        const list = document.getElementById('leader-list');
        if(!list) return;
        list.innerHTML = "";
        snap.forEach((d) => {
            const u = d.data();
            list.innerHTML += `<div class="p-4 flex justify-between items-center text-xs">
                <span>${u.email.split('@')[0]}</span>
                <span class="font-bold text-blue-600">৳${u.balance.toFixed(2)}</span>
            </div>`;
        });
    });
}

// পেমেন্ট হিস্ট্রি লোড করা
function loadHistory(uid) {
    const q = query(collection(db, "withdraws"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => {
        const list = document.getElementById('history-list');
        if(!list) return;
        list.innerHTML = "";
        snap.forEach((d) => {
            const data = d.data();
            if(data.uid === uid) {
                list.innerHTML += `<div class="bg-gray-100 p-3 rounded-xl flex justify-between items-center text-[10px]">
                    <div><b>৳${data.amount}</b><br>${data.number}</div>
                    <span class="px-2 py-1 rounded bg-blue-100 text-blue-600">${data.status}</span>
                </div>`;
            }
        });
    });
}

// ট্যাব সুইচ ফাংশন
window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    if(tab === 'leaderboard') loadLeaderboard();
};

window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    const isOpen = menu.style.transform === 'translateX(0px)';
    menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('hidden');
};

// অথেন্টিকেশন ও ডাটা হ্যান্ডলিং
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        loadHistory(user.uid);
        onSnapshot(doc(db, "users", user.uid), (s) => {
            const d = s.data();
            document.getElementById('balance').innerText = d.balance.toFixed(2);
            document.getElementById('nav-balance').innerText = d.balance.toFixed(2);
        });
    }
});

// লগইন/সাইনআপ ও অন্যান্য অরিজিনাল ফাংশন এখানে থাকবে...
