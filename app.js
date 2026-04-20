import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { /* আপনার কনফিগ দিন */ };
const IMGBB_API_KEY = 'আপনার_ImgBB_API_Key'; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentJob = null;

// --- Authentication Logic ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('auth-info').classList.remove('hidden');
        document.getElementById('user-display-email').innerText = user.email;
        loadData();
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
    }
});

// --- ImgBB & Proof Submission ---
window.openProofModal = (jobId, title, budget) => {
    currentJob = { id: jobId, title, budget };
    document.getElementById('modal-job-title').innerText = title;
    document.getElementById('proof-modal').classList.remove('hidden');
};

document.getElementById('submit-proof-btn').onclick = async () => {
    const file = document.getElementById('imageInput').files[0];
    if(!file) return alert("স্ক্রিনশট দিন!");

    const btn = document.getElementById('submit-proof-btn');
    btn.innerText = "Uploading...";
    btn.disabled = true;

    try {
        // ImgBB Upload
        const formData = new FormData();
        formData.append('image', file);
        const imgResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const imgData = await imgResponse.json();

        if(imgData.success) {
            await addDoc(collection(db, "submissions"), {
                userId: currentUserId,
                userEmail: auth.currentUser.email,
                jobId: currentJob.id,
                jobTitle: currentJob.title,
                reward: currentJob.budget,
                imageUrl: imgData.data.url,
                status: "pending",
                createdAt: new Date()
            });
            alert("প্রুফ জমা হয়েছে! এডমিন চেক করে পেমেন্ট দিবে।");
            location.reload();
        }
    } catch (e) { alert("Error: " + e.message); }
};

// --- Withdraw Request ---
document.getElementById('withdraw-btn').onclick = async () => {
    const amount = Number(document.getElementById('withdraw-amount').value);
    const phone = document.getElementById('bkash-number').value;
    
    const userSnap = await getDoc(doc(db, "users", currentUserId));
    if(userSnap.data().balance < amount) return alert("ব্যালেন্স পর্যাপ্ত নয়!");

    await addDoc(collection(db, "withdraws"), {
        userId: currentUserId,
        email: auth.currentUser.email,
        amount: amount,
        phone: phone,
        status: "pending",
        createdAt: new Date()
    });
    alert("উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!");
};

// (বাকি প্রয়োজনীয় ডাটা লোড ফাংশনগুলো এখানে থাকবে)
