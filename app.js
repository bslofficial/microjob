import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, addDoc, collection, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ফায়ারবেস কনফিগ
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

// --- ১. UI ফাংশনস ---
window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    if(!menu) return;
    const isOpen = menu.style.transform === 'translateX(0px)';
    menu.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('hidden');
};

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const activeTab = document.getElementById(tab + '-tab');
    if (activeTab) activeTab.classList.add('active');

    document.querySelectorAll('#bottom-nav button').forEach(el => el.classList.remove('active-tab'));
    const btn = document.getElementById('btn-' + tab);
    if (btn) btn.classList.add('active-tab');

    // সাইড মেনু খোলা থাকলে বন্ধ করে দেওয়া
    const menu = document.getElementById('side-menu');
    if (menu && menu.style.transform === 'translateX(0px)') window.toggleMenu();
};

window.copyReferLink = () => {
    const link = document.getElementById('refer-link').innerText;
    if (link && link !== "লোড হচ্ছে...") {
        navigator.clipboard.writeText(link).then(() => alert("রেফারেল লিঙ্ক কপি হয়েছে!"));
    }
};

// --- ২. জব লিস্ট লোড করা (আপনার সমস্যার সমাধান) ---
const loadJobs = () => {
    const jobListContainer = document.getElementById('job-list');
    if (!jobListContainer) return;

    onSnapshot(collection(db, "jobs"), (snapshot) => {
        jobListContainer.innerHTML = ""; // আগের ডাটা পরিষ্কার
        
        if (snapshot.empty) {
            jobListContainer.innerHTML = `<p class="text-center text-gray-400 text-xs py-10">বর্তমানে কোনো কাজ নেই।</p>`;
            return;
        }

        snapshot.forEach((docData) => {
            const job = docData.data();
            if (job.status === "active") {
                const div = document.createElement('div');
                div.className = "bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center mb-3";
                div.innerHTML = `
                    <div>
                        <h3 class="font-bold text-sm text-gray-800">${job.title}</h3>
                        <p class="text-[10px] text-blue-600 font-bold mt-1">পারিশ্রমিক: ৳${job.budget}</p>
                    </div>
                    <a href="${job.url}" target="_blank" class="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                        কাজটি করুন
                    </a>`;
                jobListContainer.appendChild(div);
            }
        });
    });
};

// --- ৩. এক্টিভেশন লজিক ---
window.activateAccount = async () => {
    const user = auth.currentUser;
    if (!user) return alert("দয়া করে লগইন করুন");

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userData.isActive) return alert("ইতিমধ্যেই এক্টিভ আছে!");

        if (userData.balance >= 100) {
            if (confirm("১০০ টাকা এক্টিভেশন ফি নেওয়া হবে। নিশ্চিত?")) {
                await updateDoc(userRef, { balance: increment(-100), isActive: true });
                alert("সফলভাবে এক্টিভেট হয়েছে!");
            }
        } else {
            alert("ব্যালেন্স নেই। দয়া করে রিচার্জ করুন।");
            window.switchTab('wallet');
        }
    } catch (e) { alert(e.message); }
};

// --- ৪. ডিপোজিট ও উইথড্র লজিক ---
window.submitDeposit = async () => {
    const amount = Number(document.getElementById('d-amount').value);
    const trxId = document.getElementById('d-trx').value;

    if (!amount || !trxId) return alert("সব তথ্য দিন");

    try {
        await addDoc(collection(db, "deposits"), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            amount: amount,
            trxId: trxId,
            status: "pending",
            createdAt: serverTimestamp()
        });
        alert("ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে!");
        document.getElementById('d-amount').value = "";
        document.getElementById('d-trx').value = "";
    } catch (e) { alert(e.message); }
};

window.submitWithdraw = async () => {
    const amount = Number(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value;
    const method = document.getElementById('w-method').value;

    if (!amount || !number) return alert("সব তথ্য দিন");

    try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.data().balance < amount) return alert("পর্যাপ্ত ব্যালেন্স নেই");
        if (amount < 50) return alert("নূন্যতম উইথড্র ৫০ টাকা");

        await addDoc(collection(db, "withdraws"), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            amount: amount,
            number: number,
            method: method,
            status: "pending",
            createdAt: serverTimestamp()
        });

        await updateDoc(userRef, { balance: increment(-amount) });
        alert("উইথড্র রিকোয়েস্ট সফল হয়েছে!");
    } catch (e) { alert(e.message); }
};

// --- ৫. অথেন্টিকেশন ও রিয়েল-টাইম ডাটা ---
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("সব ঘর পূরণ করুন");
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert("ভুল ইমেইল বা পাসওয়ার্ড"));
};

document.getElementById('signup-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const urlParams = new URLSearchParams(window.location.search);
    const refBy = urlParams.get('ref');

    if(!email || !pass) return alert("সব ঘর পূরণ করুন");
    if(pass.length < 6) return alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");

    createUserWithEmailAndPassword(auth, email, pass).then(async (cred) => {
        await setDoc(doc(db, "users", cred.user.uid), {
            email: email, balance: 0, isActive: false, referredBy: refBy || null,
            totalRefers: 0, referEarnings: 0, createdAt: serverTimestamp()
        });
    }).catch(err => alert("সাইন-আপ ব্যর্থ: " + err.message));
};

document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.reload());

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;

        const cleanUrl = window.location.origin + window.location.pathname;
        document.getElementById('refer-link').innerText = `${cleanUrl}?ref=${user.uid}`;

        // জব লোড করা শুরু করুন
        loadJobs();

        onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('balance').innerText = (data.balance || 0).toFixed(2);
                document.getElementById('total-refers').innerText = data.totalRefers || 0;
                document.getElementById('refer-earnings').innerText = "৳" + (data.referEarnings || 0);

                const statusEl = document.getElementById('account-status');
                if (data.isActive) {
                    statusEl.innerText = "Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-green-500 text-white rounded-full inline-block";
                    document.getElementById('activation-warning')?.classList.add('hidden');
                } else {
                    statusEl.innerText = "Not Active";
                    statusEl.className = "text-[10px] font-bold mt-1 px-2 py-0.5 bg-red-500 text-white rounded-full inline-block";
                }
            }
        });
    } else {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('main-view').classList.add('hidden');
        document.getElementById('bottom-nav').classList.add('hidden');
    }
});
