import { db, auth } from "./firebaseconfig.js";
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ব্যালেন্স আপডেট
auth.onAuthStateChanged(user => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (s) => {
            const data = s.data();
            document.getElementById('main-balance').innerText = data.balance.toFixed(2);
            document.getElementById('nav-balance').innerText = data.balance.toFixed(2);
        });
        loadLeaderboard();
    }
});

// লিডারবোর্ড লোড করা
async function loadLeaderboard() {
    const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(10));
    const snap = await getDocs(q);
    const list = document.getElementById('leader-list');
    list.innerHTML = "";
    snap.forEach((doc, i) => {
        list.innerHTML += `
            <div class="flex justify-between p-4 border-b">
                <span>${i+1}. ${doc.data().name || 'User'}</span>
                <span class="font-bold text-blue-600">৳${doc.data().balance.toFixed(2)}</span>
            </div>`;
    });
}

// উইথড্র রিকোয়েস্ট
window.requestWithdraw = async () => {
    const amount = document.getElementById('w-amount').value;
    const number = document.getElementById('w-number').value;
    if(amount < 50) return alert("নূন্যতম ৫০ টাকা প্রয়োজন");
    
    await addDoc(collection(db, "withdraws"), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        amount: Number(amount),
        number: number,
        status: "pending",
        date: new Date()
    });
    alert("রিকোয়েস্ট সফল হয়েছে!");
};
