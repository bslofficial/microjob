import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, addDoc, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyANRqR887AfhoW4GxInZHH9J3YYWCfnjs0",
    authDomain: "microjobs-b9d90.firebaseapp.com",
    projectId: "microjobs-b9d90",
    storageBucket: "microjobs-b9d90.firebasestorage.app",
    messagingSenderId: "1006928193385",
    appId: "1:1006928193385:web:d4b5cc1911abda6ff53ff8"
};

const IMGBB_API_KEY = '6727288f673551528657617936166164';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Tab Navigation Logic
window.switchTab = (tab) => {
    // Hide all tabs
    document.getElementById('home-tab').classList.add('hidden');
    document.getElementById('profile-tab').classList.add('hidden');
    document.getElementById('wallet-tab').classList.add('hidden');
    
    // Reset buttons
    const btns = ['btn-home', 'btn-profile', 'btn-wallet'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        el.className = "flex flex-col items-center text-gray-300 transition-all";
        el.querySelector('svg').setAttribute('fill', 'none');
    });

    // Show active tab
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    const activeBtn = document.getElementById(`btn-${tab}`);
    activeBtn.className = "flex flex-col items-center text-blue-600 font-bold active-tab transition-all";
    activeBtn.querySelector('svg').setAttribute('fill', 'currentColor');

    if(tab === 'profile') {
        document.getElementById('user-email').innerText = auth.currentUser.email;
        document.getElementById('p-balance').innerText = document.getElementById('balance').innerText;
    }
};

// Auth State Watcher
onAuthStateChanged(auth, (user) => {
    const bottomNav = document.getElementById('bottom-nav');
    const mainView = document.getElementById('main-view');
    const authView = document.getElementById('auth-view');
    const logoutBtn = document.getElementById('logout-btn');

    if (user) {
        authView.classList.add('hidden');
        mainView.classList.remove('hidden');
        bottomNav.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        updateUserData(user.uid);
    } else {
        authView.classList.remove('hidden');
        mainView.classList.add('hidden');
        bottomNav.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
});

async function updateUserData(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) document.getElementById('balance').innerText = userDoc.data().balance.toFixed(2);
    window.filterJobs('all');
}

window.filterJobs = async (category) => {
    const list = document.getElementById('job-list');
    list.innerHTML = `<div class="p-10 text-center text-gray-400 text-xs animate-pulse">লোড হচ্ছে...</div>`;
    
    let q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    if(category !== 'all') q = query(collection(db, "jobs"), where("category", "==", category));
    
    const snap = await getDocs(q);
    list.innerHTML = snap.empty ? `<p class="text-center py-10 text-gray-400">কোনো কাজ পাওয়া যায়নি</p>` : "";
    
    snap.forEach(d => {
        const j = d.data();
        list.innerHTML += `
            <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col gap-3">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">${j.category || 'General'}</span>
                        <h3 class="font-bold text-gray-800 mt-1">${j.title}</h3>
                    </div>
                    <div class="text-green-600 font-extrabold bg-green-50 px-3 py-1 rounded-2xl">৳${j.budget}</div>
                </div>
                <p class="text-[11px] text-gray-500 leading-relaxed">${j.description}</p>
                <button onclick="openProof('${d.id}', '${j.title}', ${j.budget})" class="w-full bg-blue-50 text-blue-600 py-3 rounded-2xl text-xs font-extrabold hover:bg-blue-600 hover:text-white transition-all">কাজটি শুরু করুন</button>
            </div>
        `;
    });
};

// Proof Logic
let currentActiveJob = null;
window.openProof = (id, title, budget) => {
    currentActiveJob = {id, title, budget};
    document.getElementById('modal-job-title').innerText = title;
    document.getElementById('proof-modal').classList.remove('hidden');
};

document.getElementById('submit-proof-btn').onclick = async () => {
    const file = document.getElementById('imageInput').files[0];
    if(!file) return alert("স্ক্রিনশট দিন!");
    
    const btn = document.getElementById('submit-proof-btn');
    btn.disabled = true; btn.innerText = "আপলোড হচ্ছে...";

    try {
        const formData = new FormData(); formData.append('image', file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const imgData = await res.json();

        if(imgData.success) {
            await addDoc(collection(db, "submissions"), {
                userId: auth.currentUser.uid,
                userEmail: auth.currentUser.email,
                jobTitle: currentActiveJob.title,
                reward: currentActiveJob.budget,
                imageUrl: imgData.data.url,
                status: "pending",
                createdAt: new Date()
            });
            alert("সফলভাবে জমা দেওয়া হয়েছে! রিভিউ করার পর ব্যালেন্স যোগ হবে।");
            document.getElementById('proof-modal').classList.add('hidden');
            location.reload();
        }
    } catch (e) { alert("ত্রুটি: " + e.message); }
};

// Withdraw Logic
document.getElementById('withdraw-btn').onclick = async () => {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value;
    const currentBalance = parseFloat(document.getElementById('balance').innerText);

    if(!amount || !number) return alert("সব তথ্য পূরণ করুন!");
    if(amount < 50) return alert("নূন্যতম উইথড্র ৫০ টাকা!");
    if(amount > currentBalance) return alert("আপনার যথেষ্ট ব্যালেন্স নেই!");

    try {
        await addDoc(collection(db, "withdraws"), {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            amount: amount,
            number: number,
            status: "pending",
            createdAt: new Date()
        });
        alert("উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!");
        location.reload();
    } catch (e) { alert(e.message); }
};

// Login/Signout Actions
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("লগইন ব্যর্থ: " + e.message));
};

document.getElementById('signup-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { email, balance: 0 });
        alert("অ্যাকাউন্ট তৈরি হয়েছে!");
    } catch (e) { alert(e.message); }
};

document.getElementById('logout-btn').onclick = () => signOut(auth);
