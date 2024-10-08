// frontend/src/components/layout/navigation/SubMainMenu.jsx
'use client';
import Link from "next/link";

export default function SubMainMenu({ items, isOpen, onMouseEnter, onMouseLeave }) {
    return (
        <div
            className="relative"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Link href="#" className="text-gray-400 hover:text-white">
                Launches
            </Link>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg z-20">
                    <ul className="flex flex-col p-2">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                                <span className={`inline-block p-2 rounded-full ${item.iconBg}`}>
                                    {item.icon}
                                </span>
                                <Link href={item.link} className="text-sm font-medium text-black">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
