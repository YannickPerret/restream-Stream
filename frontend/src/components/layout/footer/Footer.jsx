import Link from "next/link";
import Image from "next/image";
import logo from "#public/coffeeStream.png";
import {Facebook, Twitch, Twitter, Instagram} from "lucide-react";

const Footer = () => {
    return (
        <footer className="text-gray-400 py-32 w-full">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-8 md:mb-0">
                        {/* Adjusted logo size */}
                        <Image
                            src={logo}
                            alt="Company Logo"
                            width={200}
                            height={200}
                            className="object-contain mb-4"
                        />
                        <p className="text-gray-400">
                            Empowering creators to connect and grow across every platform, effortlessly and continuously.
                        </p>
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
                    <div className="flex flex-row justify-center mt-4 space-x-4">
                        <Link href="https://www.twitch.tv/beyondspeedruns" className="text-gray-400 hover:text-white">
                            <Twitch size={32}/>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <Twitter size={32}/>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <Instagram size={32}/>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
