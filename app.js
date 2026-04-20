import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, addDoc, collection, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// আপনার ফায়ারবেস কনফিগ (আগেরটিই থাকবে)
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

// --- ১. গ্লোবাল ইউজার ইন্টারফেস ফাংশনস ---

// ড্রয়ার মেনু টগল করা
window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    const isOpen = menu.style.transform === 'translateX(0px)';
    menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('hidden');
};

// ট্যাব সুইচিং লজিক
window.switchTab = (tab) => {
    // সব কন্টেন্ট হাইড করা
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // নির্দিষ্ট ট্যাব দেখানো
    const activeTab = document.getElementById(tab + '-tab');
    if (activeTab) activeTab.classList.add('active');

    // বটম নেভিগেশন কালার পরিবর্তন
    document.querySelectorAll('#bottom-nav button').forEach(el => el.classList.remove('active-tab'));
    const btn = document.getElementById('btn-' + tab);
    if (btn) btn.classList.add('active-tab');

    // মেনু খোলা থাকলে বন্ধ করা
    if (document.getElementById('side-menu').style.transform === 'translateX(0px)') window.toggleMenu();
};

// রেফারেল লিঙ্ক কপি করা
window.copyReferLink = () => {
    const link = document.getElementById('refer-link').innerText;
    if (link && link !== "লোড হচ্ছে...") {
        navigator.clipboard.writeText(link).then(() => {
            alert("রেফারেল লিঙ্ক কপি হয়েছে!");
        });
    }
};

// অ্যাকাউন্ট এক্টিভেশন (৳১০০)
window.activateAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("দয়া করে লগইন করুন");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData.isActive) return alert("আপনার অ্যাকাউন্ট অলরেডি এক্টিভ!");

    if (userData.balance >= 100) {
        if (confirm("এক্টিভেশন ফি ১০০ টাকা কাটা হবে। আপনি কি নিশ্চিত?")) {
            await updateDoc(userRef, { 
                balance: increment(-100), 
                isActive: true 
            });
            alert("অভিনন্দন! আপনার অ্যাকাউন্ট এখন এক্টিভ।");
        }
    } else {
        alert("আপনার ব্যালেন্স নেই। দয়া করে ১০০ টাকা ডিপোজিট করুন।");
        window.switchTab('wallet');
    }
};

// --- ২. অথেন্টিকেশন লজিক (Login/Signup) ---

// লগইন
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("সব ঘর পূরণ করুন");
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

// সাইন-আপ (রেফারেল ট্র্যাকিং সহ)
document.getElementById('signup-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    // URL থেকে রেফার কোড নেওয়া
    const urlParams = new URLSearchParams(window.location.search);
    const refBy = urlParams.get('ref');

    if(!email || !pass) return alert("সব ঘর পূরণ করুন");

    createUserWithEmailAndPassword(auth, email, pass).then(async (cred) => {
        await setDoc(doc(db, "users", cred.user.uid), {
            email: email,
            balance: 0,
            isActive: false,
            referredBy: refBy || null,
            totalRefers: 0,
            referEarnings: 0,
            createdAt: serverTimestamp()
        });
    }).catch(err => alert(err.message));
};

// লগআউট
document.getElementById('logout-btn').onclick = () => {
    signOut(auth).then(() => location.reload());
};

// --- ৩. রিয়েল-টাইম ডাটা লজিক ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        // UI পরিবর্তন
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;

        // রেফারেল লিঙ্ক সেট করা
        const currentUrl = window.location.origin + window.location.pathname;
        document.getElementById('refer-link').innerText = `${currentUrl}?ref=${user.uid}`;

        // ইউজারের ডাটাবেস পর্যবেক্ষণ
        onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // ব্যালেন্স ও স্ট্যাটাস আপডেট
                document.getElementById('balance').innerText = data.balance.toFixed(2);
                document.getElementById('total-refers').innerText = data.totalRefers || 0;
                document.getElementById('refer-earnings').innerText = "৳" + (data.referEarnings || 0);

                const statusEl = document.getElementById('account-status');
                if (data.isActive) {
                    statusEl.innerText = "Active";
                    statusEl.classList.replace('bg-red-500', 'bg-green-500');
                    document.getElementById('post-job-form').classList.remove('hidden');
                    document.getElementById('activation-warning').classList.add('hidden');
                } else {
                    statusEl.innerText = "Not Active";
                    statusEl.classList.replace('bg-green-500', 'bg-red-500');
                }
            }
        });
    } else {
        // লগআউট থাকলে ভিউ রিসেট
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
    }
});
