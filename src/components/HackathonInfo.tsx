import { Zap, Brain, Code, Palette, Rocket } from "lucide-react";

export default function HackathonInfo() {
    return (
        <div className="max-w-4xl mx-auto space-y-16 py-12 px-6">

            {/* Introduction */}
            <section className="text-center space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00FF9D] to-teal-400">
                    Built with Tambo.co
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Deep Dungeon isn't just a game. It's a demonstration of **Generative UI** in action.
                    We used Tambo's SDK to create an AI Dungeon Master that doesn't just describe the world—it *renders* it.
                </p>
            </section>

            {/* Judging Criteria Breakdown */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#00FF9D]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-[#00FF9D]">
                        <Zap className="w-6 h-6" />
                        <h3 className="text-xl font-bold">Potential Impact</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        By gamifying mundane tasks or educational content using Generative UI, we unlock a new way to engage users.
                        Imagine reliability engineering training where the "Dungeon" is a falling server cluster, generated in real-time.
                    </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#00FF9D]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-[#00FF9D]">
                        <Brain className="w-6 h-6" />
                        <h3 className="text-xl font-bold">Creativity & Originality</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        We moved away from the standard "chatbot" interface.
                        Instead of chatting with an AI, you *play* with it. The AI is the game engine, constructing UI components specific to your choices.
                    </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#00FF9D]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-[#00FF9D]">
                        <Code className="w-6 h-6" />
                        <h3 className="text-xl font-bold">Technical Implementation</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Deeply integrated with **Tambo SDK**. We use custom tool definitions to allow the LLM to control game state,
                        trigger animations, and update the UI layout dynamically based on the narrative flow.
                    </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#00FF9D]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-[#00FF9D]">
                        <Palette className="w-6 h-6" />
                        <h3 className="text-xl font-bold">Aesthetics & UX</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Designed with a "Pixel-Dark" aesthetic derived from retro dungeon crawlers but modernized with glassmorphism
                        and fluid Framer Motion animations to ensure a premium feel.
                    </p>
                </div>
            </section>

            {/* Future Potential */}
            <section className="bg-gradient-to-b from-[#001A10] to-black border border-[#00FF9D]/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Rocket className="w-24 h-24 text-[#00FF9D]" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Future: Gamified Education</h3>
                <p className="text-gray-400 mb-6 max-w-xl">
                    This engine can be scaled to create **Adaptive Educational Experiences**.
                    An AI tutor could generate custom "scenarios" (mini-games) for students struggling with specific concepts,
                    rendering interactive diagrams or quizzes on the fly using Tambo's Generative UI capabilities.
                </p>

                <div className="flex gap-4 flex-wrap">
                    <span className="px-3 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded-full text-xs font-mono">Generative UI</span>
                    <span className="px-3 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded-full text-xs font-mono">Adaptive Learning</span>
                    <span className="px-3 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded-full text-xs font-mono">React + AI</span>
                </div>
            </section>

        </div>
    );
}
