import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ১. আপনার Firebase কনফিগারেশন
const firebaseConfig = {
    apiKey: "AIzaSyANRqR887AfhoW4GxInZHH9J3YYWCfnjs0",
    authDomain: "microjobs-b9d90.firebaseapp.com",
    projectId: "microjobs-b9d90",
    storageBucket: "microjobs-b9d90.firebasestorage.app",
    messagingSenderId: "1006928193385",
    appId: "1:1006928193385:web:d4b5cc1911abda6ff53ff8",
    measurementId: "G-74NJW2SE9F"
};

// ২. আপনার ImgBB API Key (ছবি আপলোডের জন্য)
const IMGBB_API_KEY = 'আপনার_ImgBB_API_Key_এখানে_দিন'; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- লগইন এবং সাইন-আপ লজিক ---

// সাইন-আপ (Sign Up)
document.getElementById('signup-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert("ইমেইল এবং পাসওয়ার্ড দিন");

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // নতুন ইউজারের জন্য ডাটাবেসে প্রোফাইল তৈরি
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            balance: 0,
            uid: user.uid
        });
        alert("অ্যাকাউন্ট তৈরি সফল হয়েছে!");
    } catch (error) {
        alert("সাইন-আপ এরর: " + error.message);
    }
};

// লগইন (Login)
document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("লগইন সফল!");
    } catch (error) {
        alert("লগইন এরর: " + error.message);
    }
};

// লগআউট (Logout)
document.getElementById('logout-btn').onclick = () => signOut(auth);

// --- অথেন্টিকেশন স্টেট মনিটর (সবচেয়ে গুরুত্বপূর্ণ) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // লগইন থাকলে ড্যাশবোর্ড দেখাবে
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('auth-info').classList.remove('hidden');
        document.getElementById('user-display-email').innerText = user.email;
        
        loadBalance(user.uid);
        loadJobs();
    } else {
        // লগআউট থাকলে লগইন পেজ দেখাবে
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
        document.getElementById('auth-info').classList.add('hidden');
    }
});

// ব্যালেন্স লোড করা
async function loadBalance(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        document.getElementById('balance').innerText = userDoc.data().balance.toFixed(2);
    }
}

// জব লিস্ট লোড করা
async function loadJobs() {
    const jobList = document.getElementById('job-list');
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    jobList.innerHTML = '';
    snapshot.forEach(doc => {
        const job = doc.data();
        const jobCard = `
            <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center border">
                <div>
                    <h3 class="font-bold">${job.title}</h3>
                    <p class="text-blue-600 font-bold">৳${job.budget}</p>
                </div>
                <button onclick="openModal('${doc.id}', '${job.title}', ${job.budget})" class="bg-blue-600 text-white px-4 py-2 rounded">কাজটি করুন</button>
            </div>
        `;
        jobList.innerHTML += jobCard;
    });
}

// উইন্ডো অবজেক্টে ফাংশন যোগ করা যাতে HTML থেকে কল করা যায়
window.openModal = (id, title, budget) => {
    window.currentJob = { id, title, budget };
    document.getElementById('modal-job-title').innerText = title;
    document.getElementById('proof-modal').classList.remove('hidden');
};
