import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- ১. নতুন কাজ পাবলিশ করা ---
document.getElementById('adm-post-btn').onclick = async () => {
    const title = document.getElementById('adm-title').value;
    const budget = document.getElementById('adm-budget').value;

    if (!title || !budget) return alert("সব ঘর পূরণ করুন!");

    try {
        await addDoc(collection(db, "jobs"), {
            title: title,
            budget: Number(budget),
            createdAt: new Date()
        });
        alert("কাজটি সফলভাবে পাবলিশ হয়েছে!");
        location.reload();
    } catch (e) { alert("Error: " + e.message); }
};

// --- ২. পেন্ডিং প্রুফ লোড ও অ্যাপ্রুভ করা ---
async function loadPendingSubmissions() {
    const container = document.getElementById('pending-proofs');
    const q = query(collection(db, "submissions"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    container.innerHTML = snapshot.empty ? '<p class="text-gray-500">কোনো পেন্ডিং প্রুফ নেই।</p>' : '';

    snapshot.forEach(res => {
        const data = res.data();
        const card = `
            <div class="bg-white p-4 rounded shadow border">
                <p class="font-bold">${data.jobTitle} (৳${data.reward})</p>
                <p class="text-xs text-gray-600">ইউজার: ${data.userEmail}</p>
                <a href="${data.imageUrl}" target="_blank" class="text-blue-600 underline text-sm block my-2">স্ক্রিনশট দেখুন</a>
                <button onclick="approveWork('${res.id}', '${data.userId}', ${data.reward})" class="bg-green-600 text-white px-3 py-1 rounded text-xs">Approve</button>
            </div>
        `;
        container.innerHTML += card;
    });
}

// --- ৩. কাজ অ্যাপ্রুভ করার লজিক (টাকা ইউজারের অ্যাকাউন্টে যাবে) ---
window.approveWork = async (subId, uid, amount) => {
    try {
        // সাবমিশন স্ট্যাটাস পরিবর্তন
        await updateDoc(doc(db, "submissions", subId), { status: "approved" });
        // ইউজারের ব্যালেন্স বাড়ানো
        await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
        alert("অ্যাপ্রুভ হয়েছে এবং টাকা ইউজারের ব্যালেন্স যোগ হয়েছে!");
        location.reload();
    } catch (e) { alert(e.message); }
};

// --- ৪. উইথড্র রিকোয়েস্ট লোড করা ---
async function loadWithdrawRequests() {
    const container = document.getElementById('pending-withdraws');
    const q = query(collection(db, "withdraws"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    container.innerHTML = snapshot.empty ? '<p class="text-gray-500">কোনো রিকোয়েস্ট নেই।</p>' : '';

    snapshot.forEach(res => {
        const data = res.data();
        const card = `
            <div class="bg-white p-4 rounded shadow border border-green-200">
                <p class="font-bold text-green-700">Amount: ৳${data.amount}</p>
                <p class="text-sm">Number: ${data.phone}</p>
                <p class="text-xs text-gray-500">User: ${data.email}</p>
                <button onclick="markAsPaid('${res.id}')" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs">Mark Paid</button>
            </div>
        `;
        container.innerHTML += card;
    });
}

window.markAsPaid = async (id) => {
    await updateDoc(doc(db, "withdraws", id), { status: "paid" });
    alert("Paid হিসেবে মার্ক করা হয়েছে!");
    location.reload();
};

// ডাটা লোড কল
loadPendingSubmissions();
loadWithdrawRequests();
