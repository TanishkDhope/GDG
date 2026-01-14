
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Box, Zap, Lock, Palette, Code2, Github, Twitter, ExternalLink } from 'lucide-react';
import { productConfig } from '../config/productConfig';
import Faq from '../components/Faq'
import Ecosystem from '@/components/Ecosystem';
import Navbar from '@/components/Navbar';

gsap.registerPlugin(ScrollTrigger);

const ProductLandingPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const heroTextRef = useRef<HTMLHeadingElement>(null);
    const horizontalSectionRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Hero Animations
        const tl = gsap.timeline();

        tl.from('.hero-text-char', {
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.05,
            ease: 'power4.out',
        })
            .from('.hero-desc', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
            }, '-=0.5')
            .from('.hero-cta', {
                scale: 0.9,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out(1.7)',
            }, '-=0.3');

        // Horizontal Scroll for Features
        const track = containerRef.current!.querySelector('.features-container') as HTMLElement;

        // Calculate scroll distance (total width - viewport width)
        const getScrollAmount = () => {
            // Add a buffer to ensure full scroll
            return -(track.scrollWidth - window.innerWidth + 100);
        };

        const tween = gsap.to(track, {
            x: getScrollAmount,
            ease: "none",
        });

        ScrollTrigger.create({
            trigger: horizontalSectionRef.current,
            start: "top top",
            end: () => `+=${track.scrollWidth}`, // Scroll duration proportional to width
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true,
        });

        // Tech Stack Fade In
        gsap.from('.tech-item', {
            scrollTrigger: {
                trigger: '.tech-stack-section',
                start: 'top 80%',
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">

            {/* Dynamic Background Noise/Grid */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}>
            </div>

            {/* Navbar */}
           <Navbar/>

            {/* Hero Section */}
            <header className="relative z-10 h-screen flex flex-col justify-center px-6 md:px-20 pt-20">
                <div className="max-w-6xl">
                    <div className="overflow-hidden">
                        <h1 ref={heroTextRef} className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] mb-6 uppercase">
                            {productConfig.productName.split('').map((char, i) => (
                                <span key={i} className="hero-text-char inline-block bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
                                    {char}
                                </span>
                            ))}
                            <br />
                            <span className="text-3xl md:text-6xl font-light tracking-normal text-gray-400 normal-case block mt-4">
                                {productConfig.tagline}
                            </span>
                        </h1>
                    </div>

                    <div className="hero-desc mt-8 max-w-xl text-gray-400 text-lg leading-relaxed border-l-2 border-indigo-500 pl-6">
                        {productConfig.description}
                    </div>

                    <div className="hero-cta mt-12 flex flex-wrap gap-6 items-center">
                        <button
                            onClick={() => navigate('/market')}
                            className="group relative px-8 py-4 bg-indigo-600 text-white font-bold uppercase tracking-wider overflow-hidden rounded-sm hover:bg-indigo-700 transition-all">
                            <span className="relative z-10 flex items-center gap-2">
                                {productConfig.heroCtaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>

                        <a href={productConfig.socials.github} target="_blank" className="flex items-center gap-2 text-sm text-gray-500 font-mono uppercase hover:text-white transition-colors">
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
            </header>

            {/* Horizontal Scroll / Features */}
            <section ref={horizontalSectionRef} id="features" className="relative h-screen bg-[#050505] z-10 overflow-hidden flex items-center">
                <div className="absolute top-10 left-10 md:left-20 text-sm font-mono text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Core Features
                </div>

                <div className="features-container flex flex-nowrap pl-10 md:pl-20 pr-20 h-[60vh] items-center gap-6 md:gap-10 w-max">

                    {/* Intro Card */}
                    <div className="feature-card flex-shrink-0 w-[80vw] md:w-[25vw] h-full flex flex-col justify-end pb-12">
                        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                            BUILT FOR<br />
                            <span className="text-gray-600">THE NEXT ERA</span>
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base max-w-xs">
                            We've engineered {productConfig.productName} to solve the critical challenges of modern Web3 adoption.
                        </p>
                    </div>

                    {productConfig.features.map((feature, index) => (
                        <div key={feature.id} className="feature-card group flex-shrink-0 w-[85vw] md:w-[35vw] h-full bg-[#111] border border-white/5 p-8 md:p-12 relative hover:bg-[#161616] transition-colors duration-500 flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 group-hover:text-indigo-500/10 transition-colors select-none">
                                0{index + 1}
                            </div>

                            <div className="relative z-10">
                                <div className="mb-8 w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all text-white">
                                    {index === 0 && <Palette className="w-6 h-6" />}
                                    {index === 1 && <Lock className="w-6 h-6" />}
                                    {index === 2 && <Zap className="w-6 h-6" />}
                                    {index === 3 && <Box className="w-6 h-6" />}
                                </div>

                                <div className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase tracking-wider text-indigo-400 bg-indigo-900/10 border border-indigo-500/20 rounded-full">
                                    {feature.highlight}
                                </div>

                                <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white group-hover:text-indigo-100 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-base text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="w-full h-1 bg-white/5 mt-8 overflow-hidden rounded-full">
                                <div className="h-full bg-indigo-600 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="tech" className="tech-stack-section py-32 px-6 md:px-20 bg-[#080808] border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="md:w-1/3">
                            <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
                                <Code2 className="text-indigo-500" /> Tech Stack
                            </h2>
                            <p className="text-gray-400">
                                Powered by industry-leading technologies to ensure scalability, security, and performance.
                            </p>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
                            {productConfig.techStack.map((tech) => (
                                <div key={tech} className="tech-item p-6 bg-[#111] border border-white/5 rounded-lg hover:border-indigo-500/30 transition-colors">
                                    <div className="text-xl font-bold text-gray-200">{tech}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <Ecosystem />
            <Faq />
            {/* Footer */}
            <footer className="py-12 px-6 md:px-20 border-t border-white/10 bg-[#050505] text-center md:text-left">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-gray-600 font-mono">
                        © 2026 {productConfig.productName}. Built for the Hackathon.
                    </div>
                    <div className="flex gap-6">
                        <a href={productConfig.socials.github} className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href={productConfig.socials.twitter} className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        {productConfig.socials.demo &&
                            <a href={productConfig.socials.demo} className="text-gray-500 hover:text-white transition-colors"><ExternalLink className="w-5 h-5" /></a>
                        }
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProductLandingPage;
