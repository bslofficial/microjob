import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, increment, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// প্রুফ রিকোয়েস্ট লিস্ট লোড করা
onSnapshot(collection(db, "proofs"), (snap) => {
    const list = document.getElementById('admin-proof-list'); // আপনার admin.html এ এই আইডিটি থাকতে হবে
    if(!list) return;
    list.innerHTML = "";
    snap.forEach(d => {
        const p = d.data();
        if(p.status === "pending") {
            list.innerHTML += `
                <div class="p-4 border mb-2 bg-white rounded-xl shadow-sm">
                    <p class="text-xs font-bold">${p.email}</p>
                    <p class="text-xs text-gray-500">${p.title} (৳${p.budget})</p>
                    <div class="mt-2 flex gap-2">
                        <button onclick="window.approveProof('${d.id}', '${p.uid}', ${p.budget})" class="bg-green-600 text-white px-3 py-1 rounded text-[10px]">Approve & Pay</button>
                        <button onclick="window.rejectProof('${d.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-[10px]">Reject</button>
                    </div>
                </div>`;
        }
    });
});

// --- ব্যালেন্স অ্যাড করার মেইন ফাংশন ---
window.approveProof = async (id, uid, amount) => {
    if(confirm("ইউজারকে কি টাকা দিতে চান?")) {
        try {
            await updateDoc(doc(db, "proofs", id), { status: "approved" });
            await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
            alert("ব্যালেন্স সফলভাবে অ্যাড হয়েছে!");
        } catch (e) { alert("ত্রুটি হয়েছে!"); }
    }
};

window.rejectProof = async (id) => {
    if(confirm("বাতিল করবেন?")) await updateDoc(doc(db, "proofs", id), { status: "rejected" });
};

// ডিপোজিট অ্যাপ্রুভ সিস্টেম
window.approveDeposit = async (id, uid, amount) => {
    if(confirm("ডিপোজিট অ্যাপ্রুভ করবেন?")) {
        await updateDoc(doc(db, "deposits", id), { status: "approved" });
        await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
        alert("টাকা যোগ হয়েছে!");
    }
};
