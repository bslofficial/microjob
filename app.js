import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

function App() {
  const [view, setView] = useState('user'); // 'user' অথবা 'admin' ভিউ সুইচ করার জন্য
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');

  // ডাটাবেস থেকে জব লিস্ট লোড করা
  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
    } catch (error) {
      console.error("ডাটা লোড করতে সমস্যা হয়েছে: ", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // এডমিন দ্বারা নতুন জব পোস্ট করার ফাংশন
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title || !budget) return alert("দয়া করে সব ঘর পূরণ করুন");
    
    try {
      await addDoc(collection(db, "jobs"), {
        title,
        budget: Number(budget),
        createdAt: new Date()
      });
      alert("জব সফলভাবে পোস্ট হয়েছে!");
      setTitle(''); 
      setBudget('');
      fetchJobs(); // লিস্ট আপডেট করার জন্য পুনরায় কল
    } catch (err) {
      alert("এরর: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* নেভিগেশন বার */}
      <nav className="bg-blue-700 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-extrabold tracking-tight">MicroJobs BD</h1>
        <div className="space-x-2">
          <button 
            onClick={() => setView('user')} 
            className={`px-4 py-1.5 rounded-lg font-medium transition ${view === 'user' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}
          >
            ইউজার ড্যাশবোর্ড
          </button>
          <button 
            onClick={() => setView('admin')} 
            className={`px-4 py-1.5 rounded-lg font-medium transition ${view === 'admin' ? 'bg-white text-red-700' : 'bg-red-600 text-white'}`}
          >
            এডমিন প্যানেল
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-5xl mx-auto">
        {view === 'admin' ? (
          /* এডমিন ইন্টারফেস: কাজ পোস্ট করার জন্য */
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">নতুন কাজ যোগ করুন</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">কাজের নাম</label>
                <input 
                  type="text" 
                  placeholder="উদা: Facebook Page Like" 
                  value={title} 
                  onChange={(e)=>setTitle(e.target.value)} 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">বাজেট (৳)</label>
                <input 
                  type="number" 
                  placeholder="১০" 
                  value={budget} 
                  onChange={(e)=>setBudget(e.target.value)} 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full font-bold shadow-md transition-all">
                পাবলিশ করুন
              </button>
            </form>
          </div>
        ) : (
          /* ইউজার ইন্টারফেস: কাজ দেখার জন্য */
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">সহজ কাজ করে ইনকাম করুন</h2>
              <div className="mt-4 md:mt-0 bg-blue-100 px-6 py-3 rounded-full font-bold text-blue-800 shadow-sm">
                আপনার ব্যালেন্স: ৳০.০০
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.length > 0 ? jobs.map(job => (
                <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center border border-gray-100 hover:shadow-md transition">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                    <p className="text-blue-600 font-bold mt-1 text-md">৳{job.budget}</p>
                  </div>
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition">
                    কাজটি করুন
                  </button>
                </div>
              )) : (
                <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">বর্তমানে কোনো কাজ পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
