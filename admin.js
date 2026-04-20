import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, increment, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// আপনার Firebase Config
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

// --- ১. কাজ পাবলিশ করার লজিক ---
document.getElementById('adm-post-btn').onclick = async () => {
    const title = document.getElementById('adm-title').value;
    const category = document.getElementById('adm-category').value;
    const desc = document.getElementById('adm-desc').value;
    const budget = document.getElementById('adm-budget').value;
    const btn = document.getElementById('adm-post-btn');

    if (!title || !category || !desc || !budget) {
        return alert("সবগুলো ঘর সঠিকভাবে পূরণ করুন!");
    }

    btn.disabled = true;
    btn.innerText = "পাবলিশ হচ্ছে...";

    try {
        await addDoc(collection(db, "jobs"), {
            // টাইটেল এবং ক্যাটাগরি একসাথে সেভ করছি যাতে ফিল্টারিং সহজ হয়
            title: `${category} - ${title}`, 
            description: desc,
            budget: Number(budget),
            category: category,
            createdAt: serverTimestamp()
        });

        alert("কাজটি সফলভাবে লাইভ করা হয়েছে!");
        location.reload();
    } catch (e) {
        alert("এরর: " + e.message);
        btn.disabled = false;
        btn.innerText = "পাবলিশ করুন";
    }
};

// --- ২. পেন্ডিং প্রুফ লোড করা ---
async function loadPendingProofs() {
    const container = document.getElementById('pending-proofs');
    const q = query(collection(db, "submissions"), where("status", "==", "pending"));
    const snap = await getDocs(q);

    container.innerHTML = snap.empty ? '<p class="text-gray-400 text-sm">কোনো পেন্ডিং আবেদন নেই।</p>' : '';

    snap.forEach(d => {
        const data = d.data();
        container.innerHTML += `
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <p class="font-bold text-gray-800">${data.jobTitle}</p>
                <p class="text-xs text-blue-600 mb-2">${data.userEmail}</p>
                <a href="${data.imageUrl}" target="_blank" class="block bg-white text-blue-600 border border-blue-200 text-center py-1.5 rounded-lg text-xs font-bold mb-3 hover:bg-blue-50">স্ক্রিনশট দেখুন</a>
                <div class="flex gap-2">
                    <button onclick="approveWork('${d.id}', '${data.userId}', ${data.reward})" class="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition">Approve (৳${data.reward})</button>
                    <button onclick="rejectWork('${d.id}')" class="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-200 transition">Reject</button>
                </div>
            </div>
        `;
    });
}

// --- ৩. কাজ অ্যাপ্রুভ (টাকা পাঠানো) ---
window.approveWork = async (subId, uid, amount) => {
    if(!confirm("আপনি কি নিশ্চিত যে এটি অ্যাপ্রুভ করবেন?")) return;
    try {
        await updateDoc(doc(db, "submissions", subId), { status: "approved" });
        await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
        alert("অ্যাপ্রুভড! ইউজারের ব্যালেন্সে টাকা যোগ হয়েছে।");
        location.reload();
    } catch (e) { alert(e.message); }
};

// --- ৪. কাজ রিজেক্ট করা ---
window.rejectWork = async (subId) => {
    if(!confirm("কাজটি কি রিজেক্ট করতে চান?")) return;
    await updateDoc(doc(db, "submissions", subId), { status: "rejected" });
    alert("রিজেক্ট করা হয়েছে।");
    location.reload();
};

// ডাটা লোড কল
loadPendingProofs();
