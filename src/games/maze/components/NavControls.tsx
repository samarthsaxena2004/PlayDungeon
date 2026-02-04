
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react";

export function NavControls({ onAction }: { onAction: (text: string) => void }) {
    return (
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex gap-4 items-center justify-between">
            {/* Input Line */}
            <div className="flex-1 flex gap-2">
                <span className="text-green-500 font-mono py-2">{'>'}</span>
                <input
                    type="text"
                    placeholder="ENTER COMMAND..."
                    className="w-full bg-transparent border-none outline-none text-green-500 font-mono placeholder:text-green-900 uppercase"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onAction(e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }}
                />
            </div>

            {/* D-PAD for visual clicks */}
            <div className="grid grid-cols-3 gap-1">
                <div />
                <button onClick={() => onAction("North")} className="p-2 bg-zinc-800 hover:bg-green-900 text-green-500 rounded"><ArrowUp size={16} /></button>
                <div />
                <button onClick={() => onAction("West")} className="p-2 bg-zinc-800 hover:bg-green-900 text-green-500 rounded"><ArrowLeft size={16} /></button>
                <button onClick={() => onAction("South")} className="p-2 bg-zinc-800 hover:bg-green-900 text-green-500 rounded"><ArrowDown size={16} /></button>
                <button onClick={() => onAction("East")} className="p-2 bg-zinc-800 hover:bg-green-900 text-green-500 rounded"><ArrowRight size={16} /></button>
            </div>
        </div>
    );
}
