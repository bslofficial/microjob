import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// সাইন-আপ ফাংশন
document.getElementById('signup-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("দয়া করে ইমেইল এবং পাসওয়ার্ড লিখুন!");
        return;
    }

    if (password.length < 6) {
        alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!");
        return;
    }

    try {
        // ১. ফায়ারবেস অথেন্টিকেশনে ইউজার তৈরি
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ২. ইউজারের জন্য ডাটাবেসে (Firestore) ব্যালেন্স এবং প্রোফাইল তৈরি
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            balance: 0,
            uid: user.uid,
            createdAt: new Date()
        });

        alert("অ্যাকাউন্ট তৈরি সফল হয়েছে!");
        
    } catch (error) {
        console.error("Error signing up:", error);
        if (error.code === 'auth/email-already-in-use') {
            alert("এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে!");
        } else {
            alert("ভুল হয়েছে: " + error.message);
        }
    }
};
