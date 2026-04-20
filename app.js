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

// গুরুত্বপূর্ণ: ফাংশনগুলোকে উইন্ডো (window) অবজেক্টে সেট করা যাতে HTML বাটন থেকে কাজ করে
window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    if (!menu || !overlay) return;
    const isOpen = menu.style.transform === 'translateX(0px)';
    menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('hidden');
};

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const targetTab = document.getElementById(tab + '-tab');
    if (targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('#bottom-nav button').forEach(el => el.classList.remove('active-tab'));
    const targetBtn = document.getElementById('btn-' + tab);
    if (targetBtn) targetBtn.classList.add('active-tab');
    
    // মেনু খোলা থাকলে বন্ধ করে দেওয়া
    const menu = document.getElementById('side-menu');
    if (menu && menu.style.transform === 'translateX(0px)') window.toggleMenu();
};

// একাউন্ট এক্টিভেট করার লজিক
window.activateAccount = async () => {
    if (!auth.currentUser) return alert("দয়া করে লগইন করুন");
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    const userData = userSnap.data();

    if (userData.isActive) return alert("আপনার একাউন্ট অলরেডি এক্টিভেট আছে!");
    
    if (userData.balance >= 100) {
        if (confirm("একাউন্ট এক্টিভেট করতে ১০০ টাকা কাটা হবে। আপনি কি নিশ্চিত?")) {
            await updateDoc(userRef, {
                balance: increment(-100),
                isActive: true
            });
            alert("সফলভাবে এক্টিভেট হয়েছে!");
        }
    } else {
        alert("ব্যালেন্স নেই! কমপক্ষে ১০০ টাকা ডিপোজিট করুন।");
        window.switchTab('wallet');
    }
};

// ইউজার জব পোস্ট লজিক
const postBtn = document.getElementById('u-post-btn');
if (postBtn) {
    postBtn.onclick = async () => {
        const title = document.getElementById('u-job-title').value;
        const url = document.getElementById('u-job-url').value;
        const desc = document.getElementById('u-job-desc').value;
        const budget = document.getElementById('u-job-budget').value;

        if (!title || !budget) return alert("সব তথ্য পূরণ করুন!");

        try {
            await addDoc(collection(db, "jobs"), {
                title,
                url,
                description: desc,
                budget: Number(budget),
                status: "pending_admin",
                postedBy: auth.currentUser.email,
                createdAt: serverTimestamp()
            });
            alert("জব জমা দেওয়া হয়েছে! এডমিন এপ্রুভ করলে লাইভ হবে।");
            location.reload();
        } catch (e) {
            alert("এরর: " + e.message);
        }
    };
}

// লগআউট লজিক
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => location.reload());
    };
}

// ডাটা এবং স্ট্যাটাস আপডেট অবজার্ভার
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-email-display').innerText = user.email;
        onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('balance').innerText = data.balance.toFixed(2);
                
                const statusEl = document.getElementById('account-status');
                if (data.isActive) {
                    statusEl.innerText = "Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-green-500 rounded-full inline-block text-white";
                } else {
                    statusEl.innerText = "Not Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-red-500 rounded-full inline-block text-white";
                }
            }
        });
    }
});
