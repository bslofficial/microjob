import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, increment, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    } catch (e) { alert(e.message); }
};

// ২. ডিপোজিট রিকোয়েস্ট লোড ও এপ্রুভ
onSnapshot(collection(db, "deposits"), (snapshot) => {
    const container = document.getElementById('deposit-list');
    container.innerHTML = "";
    snapshot.forEach((docData) => {
        const d = docData.data();
        if (d.status === "pending") {
            container.innerHTML += `
                <div class="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border">
                    <div>
                        <p class="font-bold text-sm">${d.email}</p>
                        <p class="text-xs text-blue-600">৳${d.amount} | Trx: ${d.trxId}</p>
                    </div>
                    <button onclick="window.approveDeposit('${docData.id}', '${d.uid}', ${d.amount})" class="bg-green-600 text-white px-4 py-1 rounded-lg text-xs font-bold">Approve</button>
                </div>`;
        }
    });
});

window.approveDeposit = async (id, uid, amount) => {
    if (confirm("পেমেন্ট কি নিশ্চিত?")) {
        await updateDoc(doc(db, "deposits", id), { status: "approved" });
        await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
        alert("ডিপোজিট এপ্রুভ হয়েছে!");
    }
};

// ৩. উইথড্র রিকোয়েস্ট ম্যানেজ
onSnapshot(collection(db, "withdraws"), (snapshot) => {
    const container = document.getElementById('withdraw-list');
    container.innerHTML = "";
    snapshot.forEach((docData) => {
        const w = docData.data();
        if (w.status === "pending") {
            container.innerHTML += `
                <div class="p-4 bg-orange-50 rounded-2xl flex justify-between items-center border border-orange-200">
                    <div>
                        <p class="font-bold text-sm">${w.number} (${w.method})</p>
                        <p class="text-xs text-orange-600">Amount: ৳${w.amount} | User: ${w.email}</p>
                    </div>
                    <button onclick="window.completeWithdraw('${docData.id}')" class="bg-orange-600 text-white px-4 py-1 rounded-lg text-xs font-bold">Paid</button>
                </div>`;
        }
    });
});

window.completeWithdraw = async (id) => {
    if (confirm("আপনি কি টাকা পাঠিয়ে দিয়েছেন?")) {
        await updateDoc(doc(db, "withdraws", id), { status: "completed" });
        alert("উইথড্র সম্পন্ন হয়েছে!");
    }
};

// ৪. ইউজার ম্যানেজমেন্ট
onSnapshot(collection(db, "users"), (snapshot) => {
    const table = document.getElementById('user-table-body');
    table.innerHTML = "";
    snapshot.forEach((docData) => {
        const u = docData.data();
        table.innerHTML += `
            <tr class="border-b text-xs">
                <td class="py-3">${u.email}</td>
                <td class="py-3 font-bold">৳${u.balance.toFixed(1)}</td>
                <td class="py-3">${u.isActive ? '<span class="text-green-600">Active</span>' : '<span class="text-red-500">Inactive</span>'}</td>
                <td class="py-3">
                    <button onclick="window.deleteUser('${docData.id}')" class="text-red-500"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
});

window.deleteUser = async (id) => {
    if (confirm("ইউজার ডিলিট করতে চান?")) {
        await deleteDoc(doc(db, "users", id));
    }
};
