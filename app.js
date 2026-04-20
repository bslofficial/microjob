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

// Auth Handler
onAuthStateChanged(auth, async (user) => {
    const authView = document.getElementById('auth-view');
    const mainView = document.getElementById('main-view');
    const authInfo = document.getElementById('auth-info');
    const bottomBar = document.getElementById('bottom-bar');

    if (user) {
        authView.classList.add('hidden');
        mainView.classList.remove('hidden');
        authInfo.classList.remove('hidden');
        bottomBar.classList.remove('hidden');
        loadUserBalance(user.uid);
        filterJobs('all'); // প্রথমে সব কাজ লোড হবে
    } else {
        authView.classList.remove('hidden');
        mainView.classList.add('hidden');
        authInfo.classList.add('hidden');
        bottomBar.classList.add('hidden');
    }
});

// Category Filter
window.filterJobs = async (category) => {
    const container = document.getElementById('job-list');
    container.innerHTML = '<p class="text-center text-gray-400 py-10 italic">কাজ লোড হচ্ছে...</p>';
    
    let q;
    if (category === 'all') {
        q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    } else {
        // টাইটেলে ক্যাটাগরির নাম থাকলে ফিল্টার করবে
        q = query(collection(db, "jobs"), where("title", ">=", category), where("title", "<=", category + '\uf8ff'));
    }

    const snap = await getDocs(q);
    container.innerHTML = snap.empty ? '<p class="text-center text-gray-400 py-10">এই ক্যাটাগরিতে কোনো কাজ নেই।</p>' : '';
    
    snap.forEach(d => {
        const job = d.data();
        container.innerHTML += `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${job.title}</h3>
                    <span class="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">৳${job.budget}</span>
                </div>
                <p class="text-gray-500 text-xs mb-4 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                    ${job.description || 'নিয়ম অনুযায়ী কাজটি করুন।'}
                </p>
                <button onclick="window.openProof('${d.id}', '${job.title}', ${job.budget})" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl transition shadow-md">কাজটি করুন</button>
            </div>
        `;
    });
};

// --- বাকি সব ফাংশন (Login, Signup, Withdraw) আগের মতোই থাকবে ---
// (পূর্বের দেওয়া app.js এর অন্যান্য লজিকগুলো এখানে থাকবে)

async function loadUserBalance(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) document.getElementById('balance').innerText = snap.data().balance.toFixed(2);
}

document.getElementById('logout-btn').onclick = () => signOut(auth);

let currentJob = null;
window.openProof = (id, title, budget) => {
    currentJob = { id, title, budget };
    document.getElementById('modal-job-title').innerText = title;
    document.getElementById('proof-modal').classList.remove('hidden');
};

document.getElementById('submit-proof-btn').onclick = async () => {
    const file = document.getElementById('imageInput').files[0];
    if (!file) return alert("স্ক্রিনশট দিন!");
    const btn = document.getElementById('submit-proof-btn');
    btn.disabled = true; btn.innerText = "Uploading...";
    try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: fd });
        const img = await res.json();
        if (img.success) {
            await addDoc(collection(db, "submissions"), {
                userId: auth.currentUser.uid,
                userEmail: auth.currentUser.email,
                jobTitle: currentJob.title,
                reward: currentJob.budget,
                imageUrl: img.data.url,
                status: "pending",
                createdAt: new Date()
            });
            alert("প্রমাণ জমা হয়েছে!");
            location.reload();
        }
    } catch (e) { alert(e.message); btn.disabled = false; btn.innerText = "জমা দিন"; }
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

document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
};
