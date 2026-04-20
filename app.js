import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, addDoc, collection, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Config (Keep your existing config)
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

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;
        
        // Real-time Balance & Status Update
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

// একাউন্ট এক্টিভেট করার লজিক (৳১০০ কাটবে)
window.activateAccount = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const balance = userSnap.data().balance;

    if (userSnap.data().isActive) return alert("আপনার একাউন্ট অলরেডি এক্টিভেট আছে!");
    
    if (balance >= 100) {
        if (confirm("একাউন্ট এক্টিভেট করতে আপনার ব্যালেন্স থেকে ১০০ টাকা কাটা হবে। আপনি কি রাজি?")) {
            await updateDoc(userRef, {
                balance: increment(-100),
                isActive: true
            });
            alert("অভিনন্দন! আপনার একাউন্ট সফলভাবে এক্টিভেট হয়েছে।");
        }
    } else {
        alert("আপনার ব্যালেন্স পর্যাপ্ত নয়। এক্টিভেট করতে কমপক্ষে ১০০ টাকা ডিপোজিট করুন।");
        window.switchTab('wallet');
    }
};

// ... (Keep your existing Login, Signup, Logout, Deposit functions below)
