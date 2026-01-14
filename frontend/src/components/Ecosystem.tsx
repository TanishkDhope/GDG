import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

const steps = [
    {
        id: "01",
        title: <div> Start with a <br />  <span>  template </span></div>,
        description: "Leverage dozens of pre-built templates for end use cases - ranging from research report generators to resume screeners."
    },
    {
        id: "02",
        title: <div>Connect <br /> <span>Data</span></div>,
        description: "Allow your AI application to leverage raw data in any format (websites, documents, or CSVs) or directly connect with your database."
    },
    {
        id: "03",
        title: <div> Intuitive drag and drop <br /> <span>builder</span></div>,
        description: "Build and rapidly iterate on your application's architecture with a large library of components. Seamlessly transfer between no-code and Python SDK."
    },
    {
        id: "04",
        title: <div>Customize and deploy to end <br /> <span>users</span></div>,
        description: "Export a chatbot or generate an API endpoint instantly. Customize the look and feel of the application to match your brand."
    }
];

export default function Ecosystem() {
    return (
        <div className="min-h-screen inter-small bg-black text-white py-24 px-6 md:px-12 lg:px-24 font-['Inter'] flex flex-col justify-center relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-24 tracking-tight">
                    How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">works</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">

                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[60px] left-[13%] right-[13%] h-[2px] z-0">
                        <div className="w-full h-full border-t-2 border-dashed border-white/10 connector-line" />
                        {/* Animated flow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent w-1/2 h-[2px] blur-[2px] animate-shimmer" />
                    </div>

                    {steps.map((step, index) => (
                        <div key={index} className="step-card group relative bg-[#120B1C] border border-white/5 hover:border-purple-500/40 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-2 z-10">
                            {/* Number Box */}
                            <div className="w-14 h-14 rounded-2xl bg-[#1C122B] border border-white/10 flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/50">
                                <span className="font-mono text-lg font-bold text-purple-300 group-hover:text-white transition-colors">{step.id}</span>
                            </div>

                            <div className="heading text-xl font-bold mb-4 bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent group-hover:text-purple-200 transition-colors">
                                {step.title}
                            </div>

                            <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                                {step.description}
                            </p>

                            {/* Hover Arrow */}
                            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                Learn more <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
                .heading span {
                    color: #977cd7;
                }
            `}</style>
        </div>
    );
}