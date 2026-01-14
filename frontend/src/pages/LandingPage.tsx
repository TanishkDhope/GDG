import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, MapPin, Terminal, Cpu, Shield, Users } from 'lucide-react';
import { landingConfig } from '../config/landingConfig';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const heroTextRef = useRef<HTMLHeadingElement>(null);
    const horizontalSectionRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Hero Animations
        const tl = gsap.timeline();

        tl.from('.hero-text-line', {
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power4.out',
        })
            .from('.hero-sub', {
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

        // Horizontal Scroll for Problems
        const track = containerRef.current!.querySelector('.tracks-container') as HTMLElement;

        // Calculate scroll distance (total width - viewport width)
        const getScrollAmount = () => {
            return -(track.scrollWidth - window.innerWidth);
        };

        const tween = gsap.to(track, {
            x: getScrollAmount,
            ease: "none",
        });

        ScrollTrigger.create({
            trigger: horizontalSectionRef.current,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true,
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-purple-500 selection:text-white font-sans">

            {/* Dynamic Background Grid */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
                <div className="text-xl font-bold tracking-tighter uppercase font-mono">
                    {landingConfig.eventName}
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium tracking-widest uppercase">
                    <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
                    <a href="#tracks" className="hover:text-purple-400 transition-colors">Tracks</a>
                    <a href="#prizes" className="hover:text-purple-400 transition-colors">Prizes</a>
                </div>
                <button onClick={() => navigate('/market')} className="px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Launch App
                </button>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 h-screen flex flex-col justify-center px-6 md:px-20">
                <div className="max-w-5xl">
                    <div className="overflow-hidden">
                        <h1 ref={heroTextRef} className="hero-text-line text-6xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-4 bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                            {landingConfig.heroTitle.split(" ").slice(0, 2).join(" ")}
                            <br />
                            <span className="text-stroke text-transparent stroke-white/20" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
                                {landingConfig.heroTitle.split(" ").slice(2).join(" ")}
                            </span>
                        </h1>
                    </div>

                    <div className="hero-sub mt-8 max-w-xl text-gray-400 text-lg md:text-xl leading-relaxed">
                        {landingConfig.heroSubtitle}
                    </div>

                    <div className="hero-cta mt-10 flex flex-wrap gap-6 items-center">
                        <button
                            onClick={() => navigate('/market')}
                            className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-wider overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Enter App <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                            <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {landingConfig.heroCtaText} <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>

                        <div className="flex gap-6 text-sm text-gray-500 font-mono uppercase">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                {landingConfig.eventDate}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                {landingConfig.eventLocation}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Horizontal Scroll / Problem Statements */}
            <section ref={horizontalSectionRef} id="tracks" className="relative h-screen bg-[#0a0a0a] z-10 overflow-hidden flex items-center">
                <div className="absolute top-10 left-10 md:left-20 text-sm font-mono text-gray-500 uppercase tracking-widest">
            // Problem Statements
                </div>

                <div className="tracks-container flex flex-nowrap pl-10 md:pl-20 pr-20 h-[70vh] items-center gap-10 md:gap-20 w-max">

                    {/* Intro Card */}
                    <div className="problem-card flex-shrink-0 w-[80vw] md:w-[30vw] h-full flex flex-col justify-center">
                        <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800">
                            CHOOSE<br /><span className="text-white">YOUR PATH</span>
                        </h2>
                        <p className="text-gray-400 max-w-md">
                            Select a track that resonates with your vision. We've curated a set of challenges designed to push the boundaries of what's possible on-chain.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {landingConfig.problemStatements.map((problem, index) => (
                        <div key={problem.id} className="problem-card flex-shrink-0 w-[85vw] md:w-[40vw] h-full bg-[#111] border border-white/5 p-8 md:p-12 relative group hover:border-purple-500/30 transition-colors duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-10 font-[200] text-9xl group-hover:opacity-20 transition-opacity">
                                0{index + 1}
                            </div>

                            <div className="h-full flex flex-col justify-between relative z-10">
                                <div>
                                    {index === 0 && <Terminal className="w-10 h-10 mb-6 text-purple-500" />}
                                    {index === 1 && <Cpu className="w-10 h-10 mb-6 text-blue-500" />}
                                    {index === 2 && <Shield className="w-10 h-10 mb-6 text-green-500" />}
                                    {index === 3 && <Users className="w-10 h-10 mb-6 text-orange-500" />}

                                    <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight group-hover:text-purple-400 transition-colors">
                                        {problem.title}
                                    </h3>
                                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                        {problem.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-wider">
                                        {problem.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 border border-white/10 rounded-full text-gray-500 group-hover:text-white group-hover:border-white/30 transition-all">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6 mt-6 flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase mb-1">Prize Pool</div>
                                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                            {problem.prize}
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all group-hover:scale-105">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer / Contact */}
            <footer className="py-20 px-6 md:px-20 border-t border-white/10 bg-[#050505]">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                    <div>
                        <h4 className="text-2xl font-bold mb-4">{landingConfig.eventName}</h4>
                        <p className="text-gray-500 max-w-xs">{landingConfig.heroSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <h5 className="text-sm font-mono text-gray-500 mb-4 uppercase">Socials</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-purple-400">Twitter</a></li>
                                <li><a href="#" className="hover:text-purple-400">Discord</a></li>
                                <li><a href="#" className="hover:text-purple-400">Telegram</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-mono text-gray-500 mb-4 uppercase">Legal</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-purple-400">Terms</a></li>
                                <li><a href="#" className="hover:text-purple-400">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-10 border-t border-white/5 flex justify-between text-xs text-gray-600 font-mono">
                    <div>© 2026 {landingConfig.eventName}. All rights reserved.</div>
                    <div>DESIGNED WITH ANTIGRAVITY</div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
