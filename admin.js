import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, updateDoc, increment, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { /* আপনার কনফিগ এখানে পেস্ট করুন */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ডিপোজিট অ্যাপ্রুভ করার সময় ব্যালেন্স ফিক্স ---
window.approveDeposit = async (docId, uid, amount) => {
    try {
        // ১. রিকোয়েস্ট স্ট্যাটাস পরিবর্তন
        await updateDoc(doc(db, "deposits", docId), { status: "approved" });
        
        // ২. ইউজারের ব্যালেন্সে সরাসরি টাকা যোগ করা (সবচেয়ে গুরুত্বপূর্ণ অংশ)
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            balance: increment(amount)
        });
        
        alert("ডিপোজিট সফল এবং ইউজারের একাউন্টে টাকা যোগ হয়েছে!");
    } catch (e) {
        alert("Error: " + e.message);
    }
};

// --- ইউজার ব্যালেন্স ম্যানুয়ালি এডিট করা ---
window.editBalance = async (uid) => {
    const newAmount = prompt("নতুন ব্যালেন্স কত দিতে চান?");
    if(newAmount !== null) {
        await updateDoc(doc(db, "users", uid), { balance: parseFloat(newAmount) });
        alert("ব্যালেন্স আপডেট হয়েছে!");
    }
};
