import Link from "next/link";
import Image from "next/image";
import logo from "#public/coffeeStream.png";


const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-32 w-full">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-8 md:mb-0">
                        <Image src={logo} alt="Company Logo" className="h-8 mb-4 " width={120} height={120} />
                        <p className="text-gray-400">
                            Making the world a better place through constructing elegant hierarchies.
                        </p>
                        <div className="flex mt-4 space-x-4">
                            <Link href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-facebook"></i>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-instagram"></i>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-x"></i>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-github"></i>
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white">
                                <i className="fab fa-youtube"></i>
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
                        <div>
                            <h3 className="text-white font-semibold mb-4">Solutions</h3>
                            <ul>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Marketing</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Analytics</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Commerce</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Insights</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Support</h3>
                            <ul>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Pricing</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Documentation</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Guides</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">API Status</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Company</h3>
                            <ul>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">About</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Blog</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Jobs</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Press</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Partners</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Legal</h3>
                            <ul>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Claim</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Privacy</Link>
                                </li>
                                <li className="mb-2">
                                    <Link href="#" className="text-gray-400 hover:text-white">Terms</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-800 pt-8">
                    <p className="text-gray-400 text-center">
                        © 2024 CoffeeStream, Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

