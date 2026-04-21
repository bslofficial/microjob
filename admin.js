import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ১. জব পাবলিশ ফাংশন
window.adminPostJob = async () => {
    const title = document.getElementById('adm-title').value;
    const desc = document.getElementById('adm-desc').value;
    const url = document.getElementById('adm-url').value;
    const budget = Number(document.getElementById('adm-budget').value);

    if (!title || !budget) return alert("টাইটেল এবং বাজেট দিন!");

    try {
        await addDoc(collection(db, "jobs"), {
            title, description: desc, url, budget, status: "active", createdAt: serverTimestamp()
        });
        alert("জব সফলভাবে পাবলিশ হয়েছে!");
        location.reload();
    } catch (e) { alert("Error: " + e.message); }
};

// ২. জব লিস্ট রেন্ডার ও ডিলিট লজিক
onSnapshot(collection(db, "jobs"), (snap) => {
    const container = document.getElementById('admin-job-list');
    if (!container) return;
    container.innerHTML = "";
    
    if (snap.empty) container.innerHTML = "<p class='text-center text-gray-400 py-4'>কোনো জব নেই</p>";

    snap.forEach((docSnap) => {
        const job = docSnap.data();
        const jobId = docSnap.id;
        
        container.innerHTML += `
            <div class="flex justify-between items-center p-4 bg-gray-50 border rounded-2xl">
                <div>
                    <h3 class="font-bold text-sm text-gray-800">${job.title}</h3>
                    <p class="text-[10px] text-gray-500">${job.description || 'বিবরণ নেই'}</p>
                    <p class="text-[10px] text-blue-600 font-bold">বাজেট: ৳${job.budget}</p>
                </div>
                <button onclick="window.deleteJob('${jobId}')" class="text-red-500 p-2 hover:bg-red-50 rounded-full">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
});

// ডিলিট করার ফাংশন
window.deleteJob = async (id) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই জবটি ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "jobs", id));
            alert("ডিলিট সম্পন্ন হয়েছে!");
        } catch (e) { alert("Error: " + e.message); }
    }
};

// ৩. ডিপোজিট ম্যানেজমেন্ট
onSnapshot(collection(db, "deposits"), (snap) => {
    const list = document.getElementById('deposit-list');
    if (!list) return;
    list.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        if(data.status === 'pending') {
            list.innerHTML += `<div class="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border mb-2">
                <div><p class="font-bold text-xs">${data.email}</p><p class="text-[10px]">৳${data.amount} | Trx: ${data.trxId}</p></div>
                <button onclick="window.approveDeposit('${d.id}', '${data.uid}', ${data.amount})" class="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px]">Approve</button>
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

// ৪. ইউজার ম্যানেজমেন্ট
onSnapshot(collection(db, "users"), (snap) => {
    const table = document.getElementById('user-table-body');
    if (!table) return;
    table.innerHTML = "";
    snap.forEach(u => {
        const user = u.data();
        table.innerHTML += `<tr class="border-b text-xs">
            <td class="py-3">${user.email}</td>
            <td class="py-3 font-bold">৳${(user.balance || 0).toFixed(1)}</td>
            <td class="py-3">${user.isActive ? 'Active' : 'Inactive'}</td>
            <td class="py-3"><button onclick="window.deleteUser('${u.id}')" class="text-red-500"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
});

window.deleteUser = async (id) => {
    if (confirm("ইউজার ডিলিট করতে চান?")) {
        try { await deleteDoc(doc(db, "users", id)); } catch(e) { alert(e.message); }
    }
};
