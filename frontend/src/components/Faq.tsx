import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const Faqcomp = ({ text, isOpen, onClick }: any) => {
    return (
        <div
            className={`rounded-2xl cursor-pointer w-full p-5 sm:p-6 flex justify-between items-center transition-all duration-500 border backdrop-blur-sm ${isOpen
                ? 'bg-white/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)] ring-1 ring-purple-500/20'
                : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]'
                }`}
            onClick={onClick}
        >
            <h3 className={`text-base sm:text-lg font-medium transition-all duration-500 ${isOpen ? 'text-white translate-x-1' : 'text-zinc-400'}`}>
                {text}
            </h3>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${isOpen ? 'bg-purple-600 text-white rotate-180 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
                }`}>
                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
        </div>
    );
};

const Faq = () => {
    const [openId, setOpenId] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "How does the AI automation engine work?",
            answer: "Our proprietary engine combines Large Language Models with your unique business data. It contextually understands your workflows and automates repetitive tasks across your existing tool stacking using advanced RAG (Retrieval-Augmented Generation) techniques.",
        },
        {
            id: 2,
            question: "Is my corporate data secure and private?",
            answer: "Absolutely. We are SOC2 Type II compliant and use enterprise-grade encryption (AES-256). Your data is never used to train global models, and we offer private cloud deployments for maximum security control.",
        },
        {
            id: 3,
            question: "Which platforms can I integrate with?",
            answer: "We support 50+ native integrations including Slack, Salesforce, GitHub, Jira, and Microsoft 365. For custom setups, you can use our robust API or pre-built Zapier and Make.com connectors.",
        },
        {
            id: 4,
            question: "Can I customize the AI's personality and tone?",
            answer: "Yes! You can define specific brand guidelines, tone of voice, and 'guardrails' for the AI. This ensures every automated response or generated piece of content aligns perfectly with your company's identity.",
        },
        {
            id: 5,
            question: "What kind of ROI can I expect?",
            answer: "Most enterprise teams report a 40% reduction in manual data entry and a 3x increase in response speed within the first 30 days. We provide a real-time dashboard to track your automation efficiency and cost savings.",
        },
        {
            id: 6,
            question: "Do you offer developer-friendly tools?",
            answer: "Definitely. Developers have access to our SDKs (Python/Node.js), detailed documentation, and a sandbox environment to test workflows before going live. You can also build custom 'Nodes' to extend our platform's capabilities.",
        },
        {
            id: 7,
            question: "How do I get started with a pilot program?",
            answer: "Getting started is easy. You can sign up for a 14-day free trial or book a demo with our solutions architects. We'll help you identify high-impact use cases and set up your first workflow in under 15 minutes.",
        },
    ];

    const toggleFaq = (id: any) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden relative font-['Inter']">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                <div className="flex lg:flex-row flex-col items-start justify-between gap-16 lg:gap-24">
                    {/* Left side - Header */}
                    <div className="lg:sticky lg:top-24 flex-1 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
                                Support Center
                            </span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            Commonly asked<br />
                            <span className="text-purple-400">questions.</span>
                        </h2>

                        <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                            Everything you need to know about our services, process, and how we can help you achieve your goals.
                        </p>

                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                            <h4 className="font-semibold mb-2">Still have questions?</h4>
                            <p className="text-zinc-500 text-sm mb-4">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                            <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-medium text-sm">
                                Get in touch
                            </button>
                        </div>
                    </div>

                    {/* Right side - FAQ Items */}
                    <div className="flex-[1.2] w-full flex flex-col gap-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="group">
                                <Faqcomp
                                    text={faq.question}
                                    isOpen={openId === faq.id}
                                    onClick={() => toggleFaq(faq.id)}
                                />

                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="px-6 py-5 text-zinc-400 text-base leading-relaxed border-x border-b border-white/5 rounded-b-2xl bg-white/[0.01]">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Faq;