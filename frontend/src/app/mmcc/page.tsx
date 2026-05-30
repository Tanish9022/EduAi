"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/config";
import Link from "next/link";
import { 
  BookOpen, 
  ChevronDown, 
  MessageSquare, 
  X, 
  Send, 
  Sun, 
  Moon, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink,
  ChevronUp,
  FileText,
  AlertCircle,
  RotateCw,
  Loader2,
  Award,
  Users,
  Compass,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Languages
} from "lucide-react";

interface Source {
  title: string;
  snippet?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  time: string;
  showForm?: boolean;
  translatedTo?: string;
}

// FAQ Data
const FAQ_ITEMS = [
  {
    q: "What courses does MMCC Pune offer?",
    a: "MMCC offers B.Com, M.Com, BBA (General Management), BBA (International Business), BBA (Computer Applications), and B.Sc. (Computer Science)."
  },
  {
    q: "What is the admission process?",
    a: "Admissions are through the Savitribai Phule Pune University centralized system along with direct college forms for specific merit intakes. You need to register online, submit documents, and wait for merit list announcements."
  },
  {
    q: "What is the fee structure?",
    a: "Fee structures vary by course. Please ask Neha in the chat or visit the admissions office for the latest 2026-27 fee details."
  },
  {
    q: "Are scholarships available?",
    a: "Yes, MMCC offers government scholarships under various categories. EBC, SBC, and other state-sponsored schemes are available for eligible students."
  },
  {
    q: "What is the eligibility criteria?",
    a: "For UG courses: HSC (12th) pass from a recognized board. For BBA-CA/B.Sc. CS: Science or Commerce stream preferred. Specific percentage requirements vary by course."
  },
  {
    q: "What are the college timings?",
    a: "College operates from 7:30 AM to 5:30 PM, Monday to Saturday. Library hours are extended until 7:00 PM."
  }
];

export default function MmccLandingPage() {
  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTheme, setChatTheme] = useState<"light" | "dark">("light");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);

  const [popoverVisible, setPopoverVisible] = useState(false);

  // Lead Form States
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCourse, setLeadCourse] = useState("General Inquiry");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [selectedLang, setSelectedLang] = useState("english");
  const [feeFormSubmitted, setFeeFormSubmitted] = useState(false);

  // FAQ Panel State
  const [showFaq, setShowFaq] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [nehaGreeted, setNehaGreeted] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SUGGESTIONS = [
    "What UG courses are offered at MMCC Pune?",
    "What is the eligibility criteria for BBA-CA?",
    "Tell me about B.Sc. Computer Science course",
    "How can I apply for admission?"
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping, errorMsg]);

  // Show popover after 1.5 seconds delay on load/close
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPopoverDismissed = localStorage.getItem("popoverDismissed") === "true";
      if (!isPopoverDismissed && !chatOpen) {
        const popoverTimer = setTimeout(() => {
          setPopoverVisible(true);
        }, 1500);
        return () => clearTimeout(popoverTimer);
      }
    }
  }, [chatOpen]);

  // Show badge after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!chatOpen) {
        setBadgeVisible(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [chatOpen]);

  // Load Lead Captured state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const captured = localStorage.getItem("leadCaptured") === "true";
      setLeadCaptured(captured);
    }
  }, []);

  // Neha auto-greeting on FIRST chat open only (once per page load)
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (chatOpen && !hasGreetedRef.current) {
      hasGreetedRef.current = true;
      setIsTyping(true);
      const greetTimer = setTimeout(() => {
        setIsTyping(false);
        const greetingText = `Namaste! 🙏\n\nI'm Neha from the Admissions Office at MMCC Pune. Admissions for 2026-27 are now open!\n\nI can help you with course details, eligibility criteria, fee structure, scholarships, and the application process. What would you like to know?`;
        setMessages(prev => [
          {
            role: "assistant",
            content: greetingText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...prev
        ]);
      }, 1200);
      return () => clearTimeout(greetTimer);
    }
  }, [chatOpen]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputVal]);

  const toggleTheme = () => {
    setChatTheme(prev => prev === "light" ? "dark" : "light");
  };

  const toggleFaq = useCallback(() => {
    setShowFaq(prev => !prev);
    setExpandedFaqIndex(null);
  }, []);

  // Translate a single message
  const translateMessage = async (msgIndex: number, targetLang: string) => {
    const msg = messages[msgIndex];
    if (!msg || msg.role !== "assistant" || translatingIdx !== null) return;
    setTranslatingIdx(msgIndex);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: msg.content,
          target_language: targetLang,
          college_slug: "mmcc"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map((m, i) => 
          i === msgIndex ? { ...m, content: data.translated_text, translatedTo: targetLang } : m
        ));
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslatingIdx(null);
    }
  };


  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!/^[0-9]{10}$/.test(leadPhone)) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }

    setSubmittingLead(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          email: leadEmail || null,
          course: leadCourse,
          college_slug: "mmcc"
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit enquiry details.");
      }

      localStorage.setItem("leadCaptured", "true");
      localStorage.setItem("leadName", leadName);
      setLeadCaptured(true);
      setNehaGreeted(false); // trigger greeting on next render
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unable to save lead. Please check backend connection.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    setErrorMsg(null);
    setFailedMessage(null);
    if (!textToSend) setInputVal("");

    const newMsg: Message = {
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    const startTime = Date.now();
    const isFeeQuery = /fee|fees|cost|charge|payment|scholarship|शुल्क|फी|पैसे|खर्च/i.test(text);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${API_BASE_URL}/api/v1/ai/public-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          college_slug: "mmcc",
          question: text,
          conversation_history: conversationHistory,
          language: selectedLang
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Server error");
      }

      const data = await res.json();

      // Enforce 1.2s delay for typing animation
      const elapsed = Date.now() - startTime;
      if (elapsed < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - elapsed));
      }

      setMessages(prev => {
        const nextMsgs: Message[] = [
          ...prev,
          {
            role: "assistant" as const,
            content: data.answer,
            sources: data.sources,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        if (isFeeQuery && !feeFormSubmitted) {
          nextMsgs.push({
            role: "assistant" as const,
            content: "To get the in-depth fee structures, seat intake limits, and custom fee concessions for your category, please fill out your details below. Once submitted, we will redirect you to WhatsApp for direct counselor support:",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showForm: true
          });
        }
        return nextMsgs;
      });
    } catch (err: any) {
      console.error(err);
      setFailedMessage(text);
      setErrorMsg("I'm having trouble connecting to the admissions RAG system. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#A40C24] flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                MMM
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#A40C24] leading-tight">MMCC Pune</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Marathwada Mitra Mandal's College of Commerce</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-semibold text-gray-600 hover:text-[#A40C24] transition-colors">About Us</a>
              <a href="#courses" className="text-sm font-semibold text-gray-600 hover:text-[#A40C24] transition-colors">Courses</a>
              <a href="#admissions" className="text-sm font-semibold text-gray-600 hover:text-[#A40C24] transition-colors">Admissions</a>
              <a href="#contact" className="text-sm font-semibold text-gray-600 hover:text-[#A40C24] transition-colors">Contact</a>
            </nav>

            {/* Portal Redirection */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#A40C24] hover:bg-red-50 rounded-xl transition-all border border-[#A40C24]/20">
                Admin Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-[#A40C24] hover:bg-[#830a1c] rounded-xl shadow-sm transition-all">
                Register College
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#A40C24] to-[#500611] text-white py-24 lg:py-32">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero details */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-red-100">
                <Award className="h-4 w-4" /> NAAC Re-accredited 'A' Grade
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Welfare of Masses <br />
                <span className="text-red-200">"Yethe Bahutanche Hit"</span>
              </h2>
              <p className="text-lg text-red-100 max-w-xl mx-auto lg:mx-0">
                Empowering minds through quality commerce, management, and technology education since 1986. Re-accredited with 'A' Grade by NAAC.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <a href="#admissions" className="px-6 py-3 font-bold rounded-xl bg-white text-[#A40C24] hover:bg-red-50 transition-all shadow-lg hover:shadow-xl text-center">
                  Apply Now 2026-27
                </a>
                <button onClick={() => setChatOpen(true)} className="px-6 py-3 font-bold rounded-xl border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Chat Admission Assistant
                </button>
              </div>
            </div>

            {/* Quick Admission Portal Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl text-white space-y-6">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3">Admissions Calendar 2026-27</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-red-200">1</div>
                    <div>
                      <h4 className="font-bold text-sm">Online Registration Starts</h4>
                      <p className="text-xs text-red-200">First week of June 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-red-200">2</div>
                    <div>
                      <h4 className="font-bold text-sm">Merit List Announcement</h4>
                      <p className="text-xs text-red-200">Mid-June 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-red-200">3</div>
                    <div>
                      <h4 className="font-bold text-sm">Document Verification & Fee Payment</h4>
                      <p className="text-xs text-red-200">To be announced on merit publication</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-red-200">
                  *Affiliated to Savitribai Phule Pune University
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-[#A40C24]">35+</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Years of Legacy</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-[#A40C24]">3000+</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Active Students</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-[#A40C24]">50+</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Expert Faculty</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-[#A40C24]">A</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">NAAC Accredited</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Programs</h2>
            <p className="text-gray-500">We offer specialized curriculum across commerce, management and computing streams.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Commerce */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-[#A40C24] flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Commerce Stream</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Comprehensive study of commerce principles, accounts, auditing, financial markets and economics.
              </p>
              <ul className="text-xs font-semibold space-y-2 text-gray-600">
                <li className="flex items-center gap-2">• Bachelor of Commerce (B.Com)</li>
                <li className="flex items-center gap-2">• Master of Commerce (M.Com)</li>
              </ul>
            </div>

            {/* BBA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-[#A40C24] flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Business Administration</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Develop management acumen, leadership skills and entrepreneurial thinking with real-world projects.
              </p>
              <ul className="text-xs font-semibold space-y-2 text-gray-600">
                <li className="flex items-center gap-2">• BBA (General Management)</li>
                <li className="flex items-center gap-2">• BBA (International Business - IB)</li>
              </ul>
            </div>

            {/* Science / IT */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-[#A40C24] flex items-center justify-center">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Computer & Information Science</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Acquire software development, algorithmic reasoning and data systems design expertise.
              </p>
              <ul className="text-xs font-semibold space-y-2 text-gray-600">
                <li className="flex items-center gap-2">• BBA (Computer Applications - CA)</li>
                <li className="flex items-center gap-2">• B.Sc. (Computer Science - CS)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">MMCC Admissions</h2>
              <p className="text-gray-500 leading-relaxed">
                MMCC follows an online admissions model through the Savitribai Phule Pune University centralized system as well as direct college forms for specific merit intakes. Candidates must verify eligibility rules prior to registration.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-50 text-[#A40C24] font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Check Eligibility</h4>
                    <p className="text-sm text-gray-500">Verify minimum 12th Board marks required for respective courses.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-50 text-[#A40C24] font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Fill Application Online</h4>
                    <p className="text-sm text-gray-500">Provide document uploads, certificates, and academic score sheets.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-50 text-[#A40C24] font-bold flex items-center justify-center text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Merit Admission</h4>
                    <p className="text-sm text-gray-500">Wait for merit lists, proceed to direct counselling and verify original certificates.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gray-50 p-8 rounded-3xl border border-gray-200 text-center space-y-4">
              <h3 className="text-xl font-bold">Have Questions?</h3>
              <p className="text-sm text-gray-500">
                Ask our AI admissions assistant regarding fees, scholarships, documents required, and seat limits.
              </p>
              <button 
                onClick={() => setChatOpen(true)}
                className="w-full py-3 font-semibold text-white bg-[#A40C24] hover:bg-[#830a1c] rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-5 w-5" /> Start Chatting
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1C1C1E] text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">MMCC Pune</h3>
            <p className="text-sm leading-relaxed max-w-sm">
              Marathwada Mitra Mandal's College of Commerce <br />
              Established to provide value based education in Pune.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">Contact Info</h3>
            <ul className="text-sm space-y-3">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#A40C24]" /> 302/A, Deccan Gymkhana, Pune 411004</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#A40C24]" /> +91-20-25670927</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#A40C24]" /> enquiry@mmcc.edu.in</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">College Motto</h3>
            <p className="text-sm italic">
              "Yethe Bahutanche Hit" (Welfare of the Masses)
            </p>
            <p className="text-xs text-gray-500">
              © 2026 Marathwada Mitra Mandal. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* POPUP SPEECH BUBBLE */}
      {popoverVisible && !chatOpen && (
        <div 
          onClick={() => {
            setChatOpen(true);
            setPopoverVisible(false);
            localStorage.setItem("popoverDismissed", "true");
          }}
          className="fixed bottom-[32px] right-[100px] bg-white dark:bg-[#18181b] text-[#0f172a] dark:text-[#f4f4f5] p-3.5 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-[260px] z-50 flex flex-col cursor-pointer select-none animate-fadeIn"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setPopoverVisible(false);
              localStorage.setItem("popoverDismissed", "true");
            }}
            className="absolute -top-2 -left-2 bg-red-500 hover:scale-110 text-white w-5 h-5 rounded-full flex items-center justify-center shadow transition-transform z-10"
            title="Dismiss"
          >
            <X size={10} strokeWidth={3.5} />
          </button>
          <div className="text-xs font-bold leading-normal">
            Hey! I am Neha... Your Admission Assistant.
          </div>
          {/* Arrow */}
          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-[#18181b] border-t border-r border-gray-200 dark:border-gray-800" />
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) */}
      <div 
        onClick={() => {
          setChatOpen(!chatOpen);
          setBadgeVisible(false);
          setPopoverVisible(false);
        }}
        className={`fixed bottom-6 right-6 w-[65px] h-[65px] rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all hover:scale-105 active:scale-95 z-50 border-4 border-black overflow-visible ${
          chatOpen ? "bg-black text-white" : "bg-transparent"
        }`}
      >
        {chatOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <img 
            src="/neha_avatar.png" 
            alt="Neha" 
            className="w-full h-full object-cover rounded-full"
          />
        )}
        {badgeVisible && (
          <span className="absolute -top-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full animate-pulse" />
        )}
      </div>

      {/* CHAT WINDOW CONTAINER */}
      {chatOpen && (
        <div 
          className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-48px)] h-[550px] max-h-[calc(100vh-140px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50 transition-all ${
            chatTheme === "dark" 
              ? "bg-[#18181b] border-gray-800 text-gray-100" 
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-[#A40C24] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                <img 
                  src="/neha_avatar.png" 
                  alt="Neha" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div>
                <h3 className="font-bold text-sm">Neha</h3>
                <p className="text-[10px] text-red-100">Online • Admissions Counselor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="https://wa.me/919876543210?text=Hi%20Neha,%20I'm%20interested%20in%20MMCC%20Pune%20admissions." 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Chat on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.39-.002 9.775-4.394 9.777-9.789.002-2.614-1.012-5.071-2.855-6.914C16.454 2.058 13.99 1.039 11.373 1.04 5.98 1.043 1.595 5.436 1.593 10.832c-.001 1.625.485 3.21 1.402 4.62l-.993 3.626 3.714-.974zm11.104-5.088c-.305-.153-1.805-.89-2.083-.99-.278-.102-.48-.153-.682.153-.202.305-.783.99-.96 1.19-.177.204-.354.229-.658.077-2.95-1.474-4.805-4.469-4.805-4.469-.304-.52-.03-.787.23-1.043.235-.23.354-.383.48-.51.127-.127.177-.216.27-.407.093-.191.047-.357-.023-.51-.07-.153-.682-1.644-.934-2.253-.246-.593-.497-.513-.682-.523-.177-.01-.38-.01-.582-.01-.203 0-.532.076-.81.382-.278.305-1.062 1.04-1.062 2.54 0 1.5 1.089 2.948 1.239 3.15.152.204 2.144 3.273 5.193 4.59.724.314 1.29.502 1.73.642.727.23 1.39.197 1.913.12.583-.087 1.805-.738 2.058-1.45.253-.713.253-1.32.177-1.45-.077-.127-.278-.203-.582-.355z"/>
                </svg>
              </a>
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Toggle Theme"
              >
                {chatTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Language selector sub-bar */}
          <div className={`flex justify-end gap-2 px-4 py-2 border-b shrink-0 text-[10px] font-bold ${
            chatTheme === "dark" ? "bg-[#18181b] border-gray-800" : "bg-gray-100/50 border-gray-200"
          }`}>
            {["english", "hindi", "marathi"].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-2 py-0.5 rounded border transition-all uppercase ${
                  selectedLang === lang
                    ? chatTheme === "dark"
                      ? "bg-white text-black border-white"
                      : "bg-black text-white border-black"
                    : "bg-transparent text-gray-500 border-gray-300 hover:text-black dark:hover:text-white"
                }`}
              >
                {lang === "english" ? "EN" : lang === "hindi" ? "हिंदी" : "मराठी"}
              </button>
            ))}
          </div>

          {/* Messages / Form Area */}
          <div 
            ref={chatBodyRef}
            className={`flex-1 p-4 overflow-y-auto space-y-4 ${
              chatTheme === "dark" ? "bg-[#1c1c1e]" : "bg-gray-50"
            }`}
          >
            {/* Chat Mode */}
            <>
              {/* Welcome Card */}
              {messages.length === 0 && (
                <div className={`p-4 rounded-xl border border-dashed text-center space-y-2 ${
                  chatTheme === "dark" ? "border-gray-800 bg-black/20" : "border-gray-200 bg-white"
                }`}>
                  <h4 className="font-bold text-sm">Welcome to Admissions Support!</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ask any questions about UG/PG admissions, fee structures, eligibility guidelines, or courses.
                  </p>
                  <div className="flex flex-col gap-1.5 pt-2">
                    {SUGGESTIONS.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSend(s)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          chatTheme === "dark" 
                            ? "bg-gray-900 border-gray-800 hover:bg-gray-800 text-gray-300" 
                            : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Messages */}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] space-y-1">
                    <div className={`p-3 rounded-2xl text-sm ${
                      m.role === "user"
                        ? "bg-[#A40C24] text-white rounded-tr-none"
                        : chatTheme === "dark"
                          ? "bg-[#27272a] text-gray-100 border border-gray-800 rounded-tl-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"
                    }`}>
                      {/* Basic newline parsing */}
                      <div className="whitespace-pre-line leading-relaxed">{m.content}</div>

                      {/* Inline Enquiry Form */}
                      {m.showForm && !feeFormSubmitted && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2.5 text-gray-800 dark:text-gray-200 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Rahul Sharma"
                              value={leadName}
                              onChange={(e) => setLeadName(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#A40C24] text-[11px] ${
                                chatTheme === "dark"
                                  ? "bg-[#18181b] border-gray-800 text-white"
                                  : "bg-gray-50 border-gray-200 text-gray-800"
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mobile Number</label>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              placeholder="e.g. 9876543210"
                              value={leadPhone}
                              onChange={(e) => setLeadPhone(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#A40C24] text-[11px] ${
                                chatTheme === "dark"
                                  ? "bg-[#18181b] border-gray-800 text-white"
                                  : "bg-gray-50 border-gray-200 text-gray-800"
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Course of Interest</label>
                            <select
                              value={leadCourse}
                              onChange={(e) => setLeadCourse(e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#A40C24] text-[11px] ${
                                chatTheme === "dark"
                                  ? "bg-[#18181b] border-gray-800 text-white"
                                  : "bg-gray-50 border-gray-200 text-gray-800"
                              }`}
                            >
                              <option value="General Inquiry">General Inquiry</option>
                              <option value="B.Com">Bachelor of Commerce (B.Com)</option>
                              <option value="M.Com">Master of Commerce (M.Com)</option>
                              <option value="BBA">BBA (General Management)</option>
                              <option value="BBA-IB">BBA (International Business - IB)</option>
                              <option value="BBA-CA">BBA (Computer Applications - CA)</option>
                              <option value="B.Sc. CS">B.Sc. (Computer Science - CS)</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!leadName.trim() || !/^[0-9]{10}$/.test(leadPhone)) {
                                alert("Please enter a valid name and 10-digit mobile number.");
                                return;
                              }
                              setSubmittingLead(true);
                              try {
                                const res = await fetch(`${API_BASE_URL}/api/v1/ai/enquiries`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    name: leadName,
                                    phone: leadPhone,
                                    email: null,
                                    course: leadCourse,
                                    college_slug: "mmcc"
                                  })
                                });
                                if (res.ok) {
                                  localStorage.setItem("leadCaptured", "true");
                                  localStorage.setItem("leadName", leadName);
                                  setLeadCaptured(true);
                                  setFeeFormSubmitted(true);
                                  
                                  const waMsg = `Hi, I am interested in MMCC admissions.\nName: ${leadName}\nPhone: ${leadPhone}\nCourse: ${leadCourse}\nPlease share detailed fee structure and seat intake.`;
                                  const waUrl = `https://wa.me/919876543210?text=${encodeURIComponent(waMsg)}`;
                                  window.open(waUrl, "_blank");
                                } else {
                                  alert("Submission failed. Please try again.");
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Error connecting to server.");
                              } finally {
                                setSubmittingLead(false);
                              }
                            }}
                            disabled={submittingLead}
                            className="w-full py-2.5 font-bold text-white bg-[#A40C24] hover:bg-[#830a1c] rounded-xl shadow transition-colors text-[11px] disabled:opacity-50"
                          >
                            {submittingLead ? "Submitting..." : "Get Fees & Chat on WhatsApp"}
                          </button>
                        </div>
                      )}
                      
                      {m.showForm && feeFormSubmitted && (
                        <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                          ✓ Enquiry details saved! Redirected to WhatsApp.
                        </div>
                      )}

                      {/* Collapsible Source Citation List */}
                      {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-500/20 text-xs">
                          <button 
                            onClick={() => setExpandedSourceIndex(expandedSourceIndex === idx ? null : idx)}
                            className="flex items-center gap-1.5 font-bold uppercase tracking-wider opacity-85 hover:opacity-100 transition-opacity"
                          >
                            {expandedSourceIndex === idx ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            Sources ({m.sources.length})
                          </button>
                          {expandedSourceIndex === idx && (
                            <div className="mt-2 space-y-2">
                              {m.sources.map((s, sIdx) => (
                                <div 
                                  key={sIdx}
                                  className={`p-2 rounded border text-[11px] leading-relaxed ${
                                    chatTheme === "dark" 
                                      ? "bg-black/30 border-gray-800 text-gray-300" 
                                      : "bg-gray-50 border-gray-200 text-gray-600"
                                  }`}
                                >
                                  <div className="font-bold flex items-center gap-1 mb-1 text-[#A40C24]">
                                    <FileText size={10} /> {s.title}
                                  </div>
                                  {s.snippet && <div className="italic font-normal">{s.snippet}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Translate button for assistant messages */}
                    {m.role === "assistant" && !m.showForm && (
                      <div className="flex items-center gap-1 mt-1 px-1">
                        {["english", "marathi", "hindi"].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => translateMessage(idx, lang)}
                            disabled={translatingIdx !== null}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all border ${
                              chatTheme === "dark"
                                ? "border-gray-800 hover:bg-gray-800 text-gray-500 hover:text-gray-200"
                                : "border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            } ${translatingIdx === idx ? "opacity-50 cursor-wait" : ""}`}
                          >
                            {translatingIdx === idx ? (
                              <Loader2 size={8} className="animate-spin" />
                            ) : (
                              <Languages size={8} />
                            )}
                            {lang === "english" ? "EN" : lang === "marathi" ? "मराठी" : "हिंदी"}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="text-[9px] text-gray-500 text-right px-1">{m.time}</div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl rounded-tl-none ${
                    chatTheme === "dark" ? "bg-[#27272a]" : "bg-white border border-gray-200 shadow-sm"
                  }`}>
                    <div className="flex gap-1 items-center py-1 px-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 text-red-700 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle size={14} /> {errorMsg}
                </div>
                {failedMessage && (
                  <button 
                    onClick={() => handleSend(failedMessage)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#A40C24] text-white hover:bg-[#830a1c] font-bold text-[10px] uppercase transition-colors"
                  >
                    <RotateCw size={10} /> Retry Message
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FAQ Slide-Up Panel */}
          {leadCaptured && showFaq && (
            <div className={`border-t shrink-0 max-h-[240px] overflow-y-auto ${
              chatTheme === "dark" ? "bg-[#18181b] border-gray-800" : "bg-white border-gray-200"
            }`}>
              <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#A40C24]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Frequently Asked</span>
                </div>
                <button 
                  onClick={toggleFaq}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={12} className="text-gray-400" />
                </button>
              </div>
              <div className="px-3 pb-2 space-y-1.5">
                {FAQ_ITEMS.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-lg border transition-all cursor-pointer ${
                      chatTheme === "dark" 
                        ? "border-gray-800 hover:border-gray-700" 
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        chatTheme === "dark" ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle size={11} className="text-[#A40C24] shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronRight 
                        size={12} 
                        className={`shrink-0 transition-transform ${
                          expandedFaqIndex === idx ? "rotate-90" : ""
                        } text-gray-400`} 
                      />
                    </button>
                    {expandedFaqIndex === idx && (
                      <div className={`px-3 pb-2.5 text-[11px] leading-relaxed animate-fadeIn ${
                        chatTheme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>
                        <div className="pl-[19px]">{faq.a}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFaq(false);
                            handleSend(faq.q);
                          }}
                          className="ml-[19px] mt-1.5 text-[10px] font-bold text-[#A40C24] hover:underline flex items-center gap-1"
                        >
                          <MessageSquare size={9} /> Ask Neha about this
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          {leadCaptured && (
            <div className={`border-t shrink-0 ${
              chatTheme === "dark" ? "bg-[#18181b] border-gray-800" : "bg-white border-gray-200"
            }`}>
              <div className="p-3 flex items-end gap-2">
                <button
                  onClick={toggleFaq}
                  title="Frequently Asked Questions"
                  className={`h-[38px] w-[38px] rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                    showFaq
                      ? "bg-[#A40C24] text-white border-[#A40C24]"
                      : chatTheme === "dark"
                        ? "bg-[#27272a] border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <HelpCircle size={16} />
                </button>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Neha a question..."
                  className={`flex-1 max-h-24 min-h-[38px] p-2 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] resize-none leading-relaxed ${
                    chatTheme === "dark" 
                      ? "bg-[#27272a] border-gray-800 text-gray-100" 
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim() || isTyping}
                  className="h-[38px] w-[38px] rounded-xl bg-[#A40C24] hover:bg-[#830a1c] text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className={`text-center text-[9px] pb-1.5 font-medium ${
                chatTheme === "dark" ? "text-gray-600" : "text-gray-400"
              }`}>
                Powered by EduAI Assist
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
