// ১. ফায়ারবেস মডিউল ইম্পোর্ট
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ২. আপনার ফায়ারবেস কনফিগারেশন (এটি আপনার ফায়ারবেস কনসোল থেকে নিতে হবে)
const firebaseConfig = {
    apiKey: "AIzaSyANRqR887AfhoW4GxInZHH9J3YYWCfnjs0",
    authDomain: "microjobs-b9d90.firebaseapp.com",
    projectId: "microjobs-b9d90",
    storageBucket: "microjobs-b9d90.firebasestorage.app",
    messagingSenderId: "1006928193385",
    appId: "1:1006928193385:web:d4b5cc1911abda6ff53ff8"
};

// ৩. ইনিশিয়েলাইজ করা
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ৪. এডমিন চেক (নিশ্চিত করা যে আপনি লগইন আছেন)
onAuthStateChanged(auth, (user) => {
    if (!user || user.email !== "bslgaimerofficial@gmail.com") {
        console.warn("আপনি এডমিন হিসেবে লগইন নেই!");
    } else {
        console.log("এডমিন লগইন সফল!");
    }
});

// ৫. কাজ পাবলিশ করার লজিক
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
            title: `${category} - ${title}`, 
            description: desc,
            budget: Number(budget),
            category: category,
            createdAt: serverTimestamp()
        });
        alert("কাজটি সফলভাবে লাইভ করা হয়েছে!");
        location.reload();
    } catch (e) {
        alert("এরর: " + e.message); // এরর এখানে দেখাবে
        btn.disabled = false;
        btn.innerText = "পাবলিশ করুন";
    }
};

// ৬. পেন্ডিং প্রুফ লোড করা
async function loadPendingProofs() {
    const container = document.getElementById('pending-proofs');
    const q = query(collection(db, "submissions"), where("status", "==", "pending"));
    const snap = await getDocs(q);

    container.innerHTML = snap.empty ? '<p class="text-gray-400 text-sm text-center py-5">কোনো আবেদন নেই।</p>' : '';

    snap.forEach(d => {
        const data = d.data();
        container.innerHTML += `
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm mb-3">
                <p class="font-bold text-gray-800">${data.jobTitle}</p>
                <p class="text-xs text-blue-600 mb-2">${data.userEmail}</p>
                <a href="${data.imageUrl}" target="_blank" class="block bg-white text-blue-600 border border-blue-200 text-center py-1.5 rounded-lg text-xs font-bold mb-3">স্ক্রিনশট দেখুন</a>
                <div class="flex gap-2">
                    <button onclick="approveWork('${d.id}', '${data.userId}', ${data.reward})" class="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs">Approve (৳${data.reward})</button>
                    <button onclick="rejectWork('${d.id}')" class="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold text-xs">Reject</button>
                </div>
            </div>
        `;
    });
}

// ৭. অ্যাপ্রুভ এবং রিজেক্ট ফাংশন (উইন্ডো অবজেক্টে রাখা হয়েছে)
window.approveWork = async (subId, uid, amount) => {
    if(!confirm("আপনি কি নিশ্চিত?")) return;
    try {
        await updateDoc(doc(db, "submissions", subId), { status: "approved" });
        await updateDoc(doc(db, "users", uid), { balance: increment(amount) });
        alert("সফলভাবে ব্যালেন্স যোগ হয়েছে।");
        location.reload();
    } catch (e) { alert(e.message); }
};

window.rejectWork = async (subId) => {
    if(!confirm("রিজেক্ট করতে চান?")) return;
    await updateDoc(doc(db, "submissions", subId), { status: "rejected" });
    alert("রিজেক্ট করা হয়েছে।");
    location.reload();
};

loadPendingProofs();
