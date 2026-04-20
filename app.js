import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, addDoc, collection, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// Global Window Functions for HTML Buttons
window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    const isOpen = menu.style.transform === 'translateX(0px)';
    menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('hidden');
};

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    
    document.querySelectorAll('#bottom-nav button').forEach(el => el.classList.remove('active-tab'));
    document.getElementById('btn-' + tab).classList.add('active-tab');
    
    const menu = document.getElementById('side-menu');
    if (menu.style.transform === 'translateX(0px)') window.toggleMenu();
};

window.activateAccount = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const balance = userSnap.data().balance;

    if (userSnap.data().isActive) return alert("অ্যাকাউন্ট ইতিমধ্যেই এক্টিভেট আছে!");
    if (balance >= 100) {
        if (confirm("একাউন্ট এক্টিভেট করতে ১০০ টাকা কাটা হবে। আপনি কি নিশ্চিত?")) {
            await updateDoc(userRef, { balance: increment(-100), isActive: true });
            alert("সফলভাবে এক্টিভেট হয়েছে!");
        }
    } else {
        alert("অপর্যাপ্ত ব্যালেন্স! ১০০ টাকা ডিপোজিট করুন।");
    }
};

// Auth Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;

        onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('balance').innerText = data.balance.toFixed(2);
                const statusEl = document.getElementById('account-status');
                if (data.isActive) {
                    statusEl.innerText = "Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-green-500 rounded-full inline-block";
                    document.getElementById('post-job-form').classList.remove('hidden');
                    document.getElementById('activation-warning').classList.add('hidden');
                } else {
                    statusEl.innerText = "Not Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-red-500 rounded-full inline-block";
                    document.getElementById('post-job-form').classList.add('hidden');
                    document.getElementById('activation-warning').classList.remove('hidden');
                }
            }
        });
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
        document.getElementById('bottom-nav').classList.add('hidden');
    }
});

// Logout Event
document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.reload());
