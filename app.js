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

// Tab Switch Function
window.switchTab = (tab) => {
    document.getElementById('home-tab').classList.add('hidden');
    document.getElementById('profile-tab').classList.add('hidden');
    document.getElementById('wallet-tab').classList.add('hidden');
    
    document.getElementById('btn-home').className = "flex flex-col items-center text-gray-400";
    document.getElementById('btn-profile').className = "flex flex-col items-center text-gray-400";
    document.getElementById('btn-wallet').className = "flex flex-col items-center text-gray-400";

    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    document.getElementById(`btn-${tab}`).classList.add('active-tab');
    document.getElementById(`btn-${tab}`).classList.remove('text-gray-400');

    if(tab === 'profile') {
        document.getElementById('user-email').innerText = auth.currentUser.email;
        document.getElementById('p-balance').innerText = document.getElementById('balance').innerText;
    }
};

// Auth Watcher
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('auth-info').classList.remove('hidden');
        updateUI(user.uid);
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
        document.getElementById('bottom-nav').classList.add('hidden');
        document.getElementById('auth-info').classList.add('hidden');
    }
});

async function updateUI(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) document.getElementById('balance').innerText = userDoc.data().balance.toFixed(2);
    window.filterJobs('all');
}

window.filterJobs = async (cat) => {
    const list = document.getElementById('job-list');
    list.innerHTML = "লোডিং...";
    let q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    if(cat !== 'all') q = query(collection(db, "jobs"), where("category", "==", cat));
    
    const snap = await getDocs(q);
    list.innerHTML = "";
    snap.forEach(d => {
        const j = d.data();
        list.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-gray-800">${j.title}</h3>
                    <span class="text-blue-600 font-bold text-sm">৳${j.budget}</span>
                </div>
                <p class="text-[11px] text-gray-500 mb-4 bg-gray-50 p-2 rounded">${j.description}</p>
                <button onclick="openProof('${d.id}', '${j.title}', ${j.budget})" class="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow-md">কাজটি করুন</button>
            </div>
        `;
    });
};

// Proof logic
let activeJob = null;
window.openProof = (id, title, budget) => {
    activeJob = {id, title, budget};
    document.getElementById('modal-job-title').innerText = title;
    document.getElementById('proof-modal').classList.remove('hidden');
};

document.getElementById('submit-proof-btn').onclick = async () => {
    const file = document.getElementById('imageInput').files[0];
    if(!file) return alert("স্ক্রিনশট দিন!");
    const btn = document.getElementById('submit-proof-btn');
    btn.disabled = true; btn.innerText = "...";

    const fd = new FormData(); fd.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: fd });
    const data = await res.json();

    if(data.success) {
        await addDoc(collection(db, "submissions"), {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            jobTitle: activeJob.title,
            reward: activeJob.budget,
            imageUrl: data.data.url,
            status: "pending",
            createdAt: new Date()
        });
        alert("জমা হয়েছে!");
        location.reload();
    }
};

// Login/Signout
document.getElementById('login-btn').onclick = () => {
    signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value).catch(e => alert(e.message));
};
document.getElementById('logout-btn').onclick = () => signOut(auth);
