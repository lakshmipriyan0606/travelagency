import { adminMenu } from "../constant";

interface SidebarProps {
    active: string;
    onChange: (component: string) => void;
}

export default function Sidebar({ active, onChange }: SidebarProps) {
    return (
        <aside className="w-64 bg-neutral-900 text-white p-4 border-r border-neutral-800">
            <div className="text-2xl font-bold mb-8">Admin Panel</div>

            <nav className="flex flex-col gap-2">
                {adminMenu.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onChange(item.component)}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-left 
              hover:bg-neutral-800 transition
              ${active === item.component ? "bg-neutral-700 font-semibold" : ""}
            `}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
