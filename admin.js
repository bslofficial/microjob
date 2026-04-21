import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, increment, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// অ্যাডমিন ইমেইল চেক (সিকিউরিটি রুলস এর সাথে মিল রেখে)
const ADMIN_EMAIL = "bslgaimerofficial@gmail.com";

onAuthStateChanged(auth, (user) => {
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("শুধুমাত্র অ্যাডমিন লগইন করতে পারবেন!");
        window.location.href = "index.html"; 
    }
});

// ১. এডমিন থেকে নতুন জব পাবলিশ
window.adminPostJob = async () => {
    const title = document.getElementById('adm-title').value;
    const url = document.getElementById('adm-url').value;
    const budget = Number(document.getElementById('adm-budget').value);

    if (!title || !budget) return alert("সব তথ্য দিন!");

    try {
        await addDoc(collection(db, "jobs"), {
            title, url, budget, status: "active", createdAt: serverTimestamp()
        });
        alert("জব সফলভাবে লাইভ হয়েছে!");
        location.reload();
    } catch (e) { alert("ত্রুটি: " + e.message); }
};

// ২. ডিপোজিট রিকোয়েস্ট লোড ও এপ্রুভ
onSnapshot(collection(db, "deposits"), (snapshot) => {
    const container = document.getElementById('deposit-list');
    if (!container) return;
    container.innerHTML = "";
    snapshot.forEach((docData) => {
        const d = docData.data();
        if (d.status === "pending") {
            const div = document.createElement('div');
            div.className = "p-4 bg-gray-50 rounded-2xl flex justify-between items-center border";
            div.innerHTML = `
                <div>
                    <p class="font-bold text-sm">${d.email}</p>
                    <p class="text-xs text-blue-600">৳${d.amount} | Trx: ${d.trxId}</p>
                </div>
                <button onclick="window.approveDeposit('${docData.id}', '${d.uid}', ${d.amount})" class="bg-green-600 text-white px-4 py-1 rounded-lg text-xs font-bold">Approve</button>`;
            container.appendChild(div);
        }
    });
});

window.approveDeposit = async (id, uid, amount) => {
    if (confirm("পেমেন্ট কি নিশ্চিত?")) {
        try {
            await updateDoc(doc(db, "deposits", id), { status: "approved" });
            await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
            alert("ডিপোজিট এপ্রুভ হয়েছে!");
        } catch (e) { alert("Error: " + e.message); }
    }
};

// ৩. উইথড্র রিকোয়েস্ট ম্যানেজ
onSnapshot(collection(db, "withdraws"), (snapshot) => {
    const container = document.getElementById('withdraw-list');
    if (!container) return;
    container.innerHTML = "";
    snapshot.forEach((docData) => {
        const w = docData.data();
        if (w.status === "pending") {
            const div = document.createElement('div');
            div.className = "p-4 bg-orange-50 rounded-2xl flex justify-between items-center border border-orange-200";
            div.innerHTML = `
                <div>
                    <p class="font-bold text-sm">${w.number} (${w.method || 'Bkash/Nagad'})</p>
                    <p class="text-xs text-orange-600">Amount: ৳${w.amount} | User: ${w.email}</p>
                </div>
                <button onclick="window.completeWithdraw('${docData.id}')" class="bg-orange-600 text-white px-4 py-1 rounded-lg text-xs font-bold">Paid</button>`;
            container.appendChild(div);
        }
    });
});

window.completeWithdraw = async (id) => {
    if (confirm("আপনি কি টাকা পাঠিয়ে দিয়েছেন?")) {
        try {
            await updateDoc(doc(db, "withdraws", id), { status: "completed" });
            alert("উইথড্র সম্পন্ন হয়েছে!");
        } catch (e) { alert("Error: " + e.message); }
    }
};

// ৪. ইউজার ম্যানেজমেন্ট
onSnapshot(collection(db, "users"), (snapshot) => {
    const table = document.getElementById('user-table-body');
    if (!table) return;
    table.innerHTML = "";
    snapshot.forEach((docData) => {
        const u = docData.data();
        const tr = document.createElement('tr');
        tr.className = "border-b text-xs";
        tr.innerHTML = `
            <td class="py-3">${u.email}</td>
            <td class="py-3 font-bold">৳${(u.balance || 0).toFixed(1)}</td>
            <td class="py-3">${u.isActive ? '<span class="text-green-600">Active</span>' : '<span class="text-red-500">Inactive</span>'}</td>
            <td class="py-3">
                <button onclick="window.deleteUser('${docData.id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
            </td>`;
        table.appendChild(tr);
    });
});

window.deleteUser = async (id) => {
    if (confirm("ইউজার ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "users", id));
        } catch (e) { alert("Error: " + e.message); }
    }
};
