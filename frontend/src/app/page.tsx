"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, FileText, Activity, ShieldCheck, Clock, Users, Zap, CheckCircle2, Bot, AlertTriangle } from 'lucide-react';
import { useRef } from 'react';

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [100, 0, 0, -100]);

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50 overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      <main className="flex-1 relative z-10 flex flex-col w-full">
        
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-10 pb-20 text-center max-w-6xl mx-auto w-full relative">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-medium mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            MediScript AI Vision 2.0 Now Live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Decode Prescriptions. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empower Patients.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Instantly digitize handwritten prescriptions, extract clinical entities, verify safety against your health profile, and set smart medication reminders—all powered by advanced AI.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/scan" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              Start Free Scan <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              View Demo Dashboard
            </Link>
          </motion.div>

          {/* Floating Hero UI Elements */}
          <div className="absolute top-1/4 -left-12 lg:-left-24 hidden md:block opacity-60 hover:opacity-100 transition-opacity">
            <FloatingCard delay={0}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><CheckCircle2 size={20}/></div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800">Paracetamol 500mg</div>
                  <div className="text-xs text-slate-500">1-0-1 (After Food)</div>
                </div>
              </div>
            </FloatingCard>
          </div>
          
          <div className="absolute bottom-1/4 -right-12 lg:-right-24 hidden md:block opacity-60 hover:opacity-100 transition-opacity">
            <FloatingCard delay={0.5}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><AlertTriangle size={20}/></div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800">Safety Check</div>
                  <div className="text-xs text-slate-500">Potential Interaction Detected</div>
                </div>
              </div>
            </FloatingCard>
          </div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section ref={targetRef} className="py-24 px-6 max-w-7xl mx-auto w-full">
          <motion.div style={{ opacity, y }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Designed for patients and caregivers to bring clarity to medical care.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Large Span */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative shadow-2xl"
            >
              <div className="relative z-10 w-full md:w-2/3">
                <Activity className="text-blue-400 mb-6" size={32} />
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Intelligent Prescription Scanner</h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  Upload an image or PDF of your doctor&apos;s handwritten notes. Our specialized Vision Language Model perfectly extracts medicines, dosages, and duration in seconds.
                </p>
                <Link href="/scan" className="inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors">
                  Try it now <ArrowRight size={16} />
                </Link>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Bento 2: Standard */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <ShieldCheck className="text-emerald-500 mb-6" size={32} />
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Safety Verification</h3>
                <p className="text-slate-600">Cross-references new medicines against your profile to detect allergies and drug interactions via Trusted Medical RAG.</p>
              </div>
            </motion.div>

            {/* Bento 3: Standard */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <Clock className="text-purple-500 mb-6" size={32} />
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Timelines</h3>
                <p className="text-slate-600">Automatically translates 1-0-1 into a schedule. Get reminders for Morning, Afternoon, Evening, and Night.</p>
              </div>
            </motion.div>

            {/* Bento 4: Large Span */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-200 shadow-sm relative overflow-hidden"
            >
              <div className="relative z-10 w-full md:w-2/3">
                <Users className="text-blue-600 mb-6" size={32} />
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Caregiver Mode</h3>
                <p className="text-slate-700 text-lg leading-relaxed mb-8">
                  Manage medical profiles and active prescriptions for your dependents, elderly parents, or children. Monitor their adherence in real-time.
                </p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-700 font-bold hover:text-blue-800 transition-colors">
                  Explore Dashboard <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THREE TIER SAFETY SECTION */}
        <section className="py-24 bg-white border-t border-slate-100 w-full">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">The 3-Tier AI Safety System</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Explain</h3>
                <p className="text-slate-600 max-w-sm">Decodes doctor handwriting and medical shorthand (e.g. SOS, OD, BD) into plain, understandable language.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                  <Bot size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Inform</h3>
                <p className="text-slate-600 max-w-sm">Provides contextual, evidence-based medication information retrieved strictly from Trusted Medical Knowledge Bases.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Guide</h3>
                <p className="text-slate-600 max-w-sm">Alerts you to potential risks based on your profile, always prioritizing a consultation with your healthcare provider.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FloatingCard({ children, delay }: { children: React.ReactNode, delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/40"
    >
      {children}
    </motion.div>
  );
}
