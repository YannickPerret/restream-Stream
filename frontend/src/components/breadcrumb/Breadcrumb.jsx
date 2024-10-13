import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ paths }) => {
    return (
        <nav className="flex items-center text-gray-600 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1">
                {paths.map((path, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index !== 0 && (
                            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                        )}
                        {index < paths.length - 1 ? (
                            <Link href={path.href}>
                                <a className="hover:text-indigo-600 transition-colors duration-200">
                                    {path.label}
                                </a>
                            </Link>
                        ) : (
                            <span className="text-gray-500">{path.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;

// Utilisation :
// <Breadcrumb
//   paths={[
//     { label: 'Accueil', href: '/' },
//     { label: 'Administration', href: '/admin' },
//     { label: 'Campagnes', href: '/admin/campaigns' },
//     { label: 'Créer' },
//   ]}
// />

// Note : Le dernier item n'a pas de href, car c'est la page actuelle.