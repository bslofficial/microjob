<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - MicroJobs BD</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        body { font-family: 'Hind Siliguri', sans-serif; }
        .tab-btn.active { background: #2563eb; color: white; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">

    <header class="bg-slate-900 text-white p-5 shadow-xl sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold"><i class="fas fa-user-shield text-blue-400"></i> Admin Panel</h1>
            <div id="admin-info" class="hidden"><button onclick="window.handleLogout()" class="bg-red-500 px-4 py-1.5 rounded-lg font-bold text-sm">Logout</button></div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto p-4 md:p-8">
        <div id="admin-auth" class="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl mt-10">
            <h2 class="text-xl font-bold mb-6 text-center">Admin Login</h2>
            <input id="email" type="email" placeholder="Admin Email" class="w-full border p-4 rounded-2xl mb-3 outline-none">
            <input id="password" type="password" placeholder="Password" class="w-full border p-4 rounded-2xl mb-6 outline-none">
            <button id="login-btn" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Login</button>
        </div>

        <div id="admin-view" class="hidden">
            <div class="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border">
                <button onclick="showTab('jobs')" class="tab-btn active px-6 py-2 rounded-xl text-sm font-bold">Manage Jobs</button>
                <button onclick="showTab('deposits')" class="tab-btn px-6 py-2 rounded-xl text-sm font-bold">Deposits</button>
                <button onclick="showTab('withdraws')" class="tab-btn px-6 py-2 rounded-xl text-sm font-bold">Withdraws</button>
            </div>

            <div id="jobs-tab" class="tab-content">
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                        <h3 class="font-bold mb-4">Post New Job</h3>
                        <div class="space-y-3">
                            <input id="job-title" type="text" placeholder="জব টাইটেল" class="w-full p-3 bg-gray-50 border rounded-xl outline-none">
                            <textarea id="job-desc" placeholder="কাজের নিয়মাবলী/ডেসক্রিপশন" class="w-full p-3 bg-gray-50 border rounded-xl outline-none h-24"></textarea>
                            <input id="job-url" type="url" placeholder="URL" class="w-full p-3 bg-gray-50 border rounded-xl outline-none">
                            <input id="job-budget" type="number" placeholder="পুরস্কার (৳)" class="w-full p-3 bg-gray-50 border rounded-xl outline-none">
                            <button onclick="window.postJob()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">পাবলিশ জব</button>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border">
                        <h3 class="font-bold mb-4">Live & Pending Jobs</h3>
                        <div id="admin-job-list" class="space-y-3"></div>
                    </div>
                </div>
            </div>

            <div id="deposits-tab" class="tab-content hidden"><div id="deposit-list" class="space-y-2"></div></div>
            <div id="withdraws-tab" class="tab-content hidden"><div id="withdraw-list" class="space-y-2"></div></div>
        </div>
    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getFirestore, doc, onSnapshot, collection, updateDoc, increment, addDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
        import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

        const ADMIN_EMAIL = "bslgaimerofficial@gmail.com"; // আপনার দেওয়া ইমেইল

        onAuthStateChanged(auth, (user) => {
            if (user && user.email === ADMIN_EMAIL) {
                document.getElementById('admin-auth').classList.add('hidden');
                document.getElementById('admin-view').classList.remove('hidden');
                document.getElementById('admin-info').classList.remove('hidden');
                loadJobs();
            } else if (user) {
                alert("অ্যাক্সেস ডিনাইড!");
                signOut(auth).then(() => location.href = "index.html");
            }
        });

        // জব পাবলিশ (Description সহ)
        window.postJob = async () => {
            const title = document.getElementById('job-title').value;
            const desc = document.getElementById('job-desc').value;
            const url = document.getElementById('job-url').value;
            const budget = Number(document.getElementById('job-budget').value);
            if(!title || !budget || !url) return alert("তথ্য দিন!");
            await addDoc(collection(db, "jobs"), { title, description: desc, url, budget, status: "active", createdAt: serverTimestamp() });
            alert("জব পাবলিশ হয়েছে!");
            location.reload();
        };

        // জব ম্যানেজমেন্ট লিস্ট
        const loadJobs = () => {
            onSnapshot(collection(db, "jobs"), (snap) => {
                const container = document.getElementById('admin-job-list');
                container.innerHTML = "";
                snap.forEach(d => {
                    const job = d.data();
                    container.innerHTML += `
                        <div class="p-4 border rounded-2xl bg-gray-50 text-xs">
                            <h4 class="font-bold">${job.title}</h4>
                            <p class="text-gray-500 mt-1">${job.description || ''}</p>
                            <div class="flex justify-between mt-3">
                                <span class="font-bold text-blue-600">৳${job.budget}</span>
                                <button onclick="window.deleteJob('${d.id}')" class="text-red-500 font-bold">Delete</button>
                            </div>
                        </div>`;
                });
            });
        };

        window.deleteJob = async (id) => { if(confirm("ডিলিট করবেন?")) await deleteDoc(doc(db, "jobs", id)); };
        window.showTab = (tabId) => {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(tabId + '-tab').classList.remove('hidden');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
        };
        document.getElementById('login-btn').onclick = () => signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value);
        window.handleLogout = () => signOut(auth).then(() => location.reload());
    </script>
</body>
</html>
