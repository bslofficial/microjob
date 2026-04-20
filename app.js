import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, addDoc, collection, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// Global UI Functions
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
    const btn = document.getElementById('btn-' + tab);
    if(btn) btn.classList.add('active-tab');
    if (document.getElementById('side-menu').style.transform === 'translateX(0px)') window.toggleMenu();
};

window.copyReferLink = () => {
    const link = document.getElementById('refer-link').innerText;
    navigator.clipboard.writeText(link).then(() => alert("লিঙ্ক কপি হয়েছে!"));
};

// অ্যাকাউন্ট এক্টিভেট সিস্টেম (৳১০০)
window.activateAccount = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.data().isActive) return alert("ইতিমধ্যেই এক্টিভেট আছে!");
    
    if (userSnap.data().balance >= 100) {
        if (confirm("১০০ টাকা দিয়ে এক্টিভেট করতে চান?")) {
            await updateDoc(userRef, { balance: increment(-100), isActive: true });
            alert("সফলভাবে এক্টিভেট হয়েছে!");
        }
    } else {
        alert("ব্যালেন্স নেই! ১০০ টাকা ডিপোজিট করুন।");
        window.switchTab('wallet');
    }
};

// Login/Signup Logic
document.getElementById('login-btn').onclick = () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, e, p).catch(err => alert(err.message));
};

document.getElementById('signup-btn').onclick = () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    createUserWithEmailAndPassword(auth, e, p).then(async (cred) => {
        await setDoc(doc(db, "users", cred.user.uid), {
            email: e, balance: 0, isActive: false, createdAt: serverTimestamp()
        });
    }).catch(err => alert(err.message));
};

document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.reload());

// Auth & Data Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;
        document.getElementById('refer-link').innerText = `https://bslofficial.github.io/?ref=${user.uid}`;

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
    }
});
