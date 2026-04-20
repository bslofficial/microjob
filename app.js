// 'Import' এর জায়গায় 'import' (ছোট হাতের i) হবে
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, addDoc, collection, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ফায়ারবেস কনফিগ (আপনার কনফিগটি এখানে থাকবে)
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

// --- ১. UI ফাংশনস ---
window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    const isOpen = menu.style.transform === 'translateX(0px)';
    menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('hidden');
};

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const activeTab = document.getElementById(tab + '-tab');
    if (activeTab) activeTab.classList.add('active');

    document.querySelectorAll('#bottom-nav button').forEach(el => el.classList.remove('active-tab'));
    const btn = document.getElementById('btn-' + tab);
    if (btn) btn.classList.add('active-tab');

    if (document.getElementById('side-menu').style.transform === 'translateX(0px)') window.toggleMenu();
};

window.copyReferLink = () => {
    const link = document.getElementById('refer-link').innerText;
    if (link && link !== "লোড হচ্ছে...") {
        navigator.clipboard.writeText(link).then(() => alert("রেফারেল লিঙ্ক কপি হয়েছে!"));
    }
};

// --- ২. এক্টিভেশন লজিক ---
window.activateAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("দয়া করে লগইন করুন");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData.isActive) return alert("ইতিমধ্যেই এক্টিভ আছে!");

    if (userData.balance >= 100) {
        if (confirm("১০০ টাকা এক্টিভেশন ফি নেওয়া হবে। নিশ্চিত?")) {
            await updateDoc(userRef, { balance: increment(-100), isActive: true });
            alert("সফলভাবে এক্টিভেট হয়েছে!");
        }
    } else {
        alert("ব্যালেন্স নেই। দয়া করে রিচার্জ করুন।");
        window.switchTab('wallet');
    }
};

// --- ৩. অথেন্টিকেশন ---
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("সব ঘর পূরণ করুন");
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert("লগইন ব্যর্থ: " + err.message));
};

document.getElementById('signup-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const urlParams = new URLSearchParams(window.location.search);
    const refBy = urlParams.get('ref');

    if(!email || !pass) return alert("সব ঘর পূরণ করুন");

    createUserWithEmailAndPassword(auth, email, pass).then(async (cred) => {
        await setDoc(doc(db, "users", cred.user.uid), {
            email: email, balance: 0, isActive: false, referredBy: refBy || null,
            totalRefers: 0, referEarnings: 0, createdAt: serverTimestamp()
        });
    }).catch(err => alert("সাইন-আপ ব্যর্থ: " + err.message));
};

document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.reload());

// --- ৪. রিয়েল-টাইম ডাটা ট্র্যাকিং ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;

        // ক্লিন রেফার লিঙ্ক জেনারেশন
        const cleanUrl = window.location.origin + window.location.pathname;
        document.getElementById('refer-link').innerText = `${cleanUrl}?ref=${user.uid}`;

        onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('balance').innerText = (data.balance || 0).toFixed(2);
                document.getElementById('total-refers').innerText = data.totalRefers || 0;
                document.getElementById('refer-earnings').innerText = "৳" + (data.referEarnings || 0);

                const statusEl = document.getElementById('account-status');
                if (data.isActive) {
                    statusEl.innerText = "Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-green-500 rounded-full inline-block";
                    document.getElementById('post-job-form').classList.remove('hidden');
                    document.getElementById('activation-warning').classList.add('hidden');
                } else {
                    statusEl.innerText = "Not Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-red-500 rounded-full inline-block";
                }
            }
        });
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
        document.getElementById('bottom-nav').classList.add('hidden');
    }
});
