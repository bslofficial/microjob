import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// আপনার ফায়ারবেস কনফিগারেশন
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

// --- ১. নতুন জব পাবলিশ (Description সহ) ---
window.adminPostJob = async () => {
    const title = document.getElementById('adm-title').value;
    const desc = document.getElementById('adm-desc').value; // ডেসক্রিপশন বক্সের আইডি
    const url = document.getElementById('adm-url').value;
    const budget = Number(document.getElementById('adm-budget').value);

    if (!title || !desc || !budget) {
        return alert("টাইটেল, ডেসক্রিপশন এবং বাজেট অবশ্যই দিতে হবে!");
    }

    try {
        await addDoc(collection(db, "jobs"), {
            title: title,
            description: desc,
            url: url,
            budget: budget,
            status: "active",
            createdAt: serverTimestamp()
        });
        alert("জব সফলভাবে পাবলিশ হয়েছে!");
        
        // ইনপুট বক্স খালি করা
        document.getElementById('adm-title').value = "";
        document.getElementById('adm-desc').value = "";
        document.getElementById('adm-url').value = "";
        document.getElementById('adm-budget').value = "";
    } catch (e) {
        alert("Error: " + e.message);
    }
};

// --- ২. জব লিস্ট ম্যানেজমেন্ট (যেখান থেকে ডিলিট করা যাবে) ---
onSnapshot(collection(db, "jobs"), (snap) => {
    const container = document.getElementById('admin-job-list');
    if (!container) return;
    
    container.innerHTML = "";
    if (snap.empty) {
        container.innerHTML = "<p class='text-gray-400 text-center py-4'>কোনো জব নেই</p>";
        return;
    }

    snap.forEach((docSnap) => {
        const job = docSnap.data();
        const jobId = docSnap.id;
        
        const div = document.createElement('div');
        div.className = "flex justify-between items-start p-4 bg-gray-50 border rounded-2xl mb-3";
        div.innerHTML = `
            <div class="flex-1 pr-4">
                <h3 class="font-bold text-sm text-gray-800">${job.title}</h3>
                <p class="text-[11px] text-gray-500 mt-1">${job.description || 'বিবরণ নেই'}</p>
                <p class="text-[10px] font-bold text-blue-600 mt-1">বাজেট: ৳${job.budget} | স্ট্যাটাস: ${job.status}</p>
            </div>
            <div class="flex flex-col gap-2">
                <button onclick="window.deleteJob('${jobId}')" class="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-all">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
});

// --- ৩. জব ডিলিট করার ফাংশন ---
window.deleteJob = async (id) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই জবটি ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "jobs", id));
            alert("সফলভাবে ডিলিট হয়েছে!");
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
};

// --- ৪. পেন্ডিং ডিপোজিট এপ্রুভাল ---
onSnapshot(collection(db, "deposits"), (snap) => {
    const list = document.getElementById('deposit-list');
    if (!list) return;
    list.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        if(data.status === 'pending') {
            const div = document.createElement('div');
            div.className = "p-3 border rounded-xl flex justify-between items-center bg-green-50";
            div.innerHTML = `
                <div class="text-[10px]">
                    <p><b>User:</b> ${data.email}</p>
                    <p><b>TrxID:</b> ${data.trxId} | <b>Amount:</b> ৳${data.amount}</p>
                </div>
                <button onclick="window.approveDeposit('${d.id}', '${data.uid}', ${data.amount})" class="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px]">Approve</button>
            `;
            list.appendChild(div);
        }
    });
});

// --- ৫. ইউজার ডিলিট করা ---
window.deleteUser = async (id) => {
    if (confirm("এই ইউজারকে কি ডিলিট করতে চান?")) {
        try {
            await deleteDoc(doc(db, "users", id));
            alert("ইউজার ডিলিট হয়েছে!");
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
};

// ইউজার টেবিল রেন্ডার
onSnapshot(collection(db, "users"), (snap) => {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;
    tbody.innerHTML = "";
    snap.forEach(u => {
        const user = u.data();
        tbody.innerHTML += `
            <tr class="border-b text-xs">
                <td class="py-3">${user.email}</td>
                <td class="py-3 font-bold">৳${(user.balance || 0).toFixed(2)}</td>
                <td class="py-3">${user.isActive ? '<span class="text-green-500">Active</span>' : '<span class="text-red-500">Inactive</span>'}</td>
                <td class="py-3">
                    <button onclick="window.deleteUser('${u.id}')" class="text-red-500"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });
});
