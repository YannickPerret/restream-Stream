import React from 'react';
import FeatureCard from './FeatureCard';
import { Database, Code, Shield, Globe, Server, Cloud } from 'lucide-react';

const FeaturesSection = () => {
    const features = [
        {
            icon: Database,
            title: "Multi-Platform Integration",
            description: "Effortlessly connect your YouTube, Twitch, Facebook, and TikTok accounts to centralize your content"
        },
        {
            icon: Code,
            title: "Automated Streaming Schedule",
            description: "Set up and manage a 24/7 streaming schedule with ease, keeping your channel active even when you're offline"
        },
        {
            icon: Shield,
            title: "Continuous Audience Engagement",
            description: "Keep your viewers engaged with automatic reruns of your streams, maximizing your reach and viewer retention"
        },
        {
            icon: Globe,
            title: "Revenue Optimization",
            description: "Increase your ad revenue and subscriber count with uninterrupted streams, ensuring a steady flow of income"
        },
        {
            icon: Server,
            title: "Advanced Analytics",
            description: "Gain insights into viewer behavior, engagement metrics, and growth trends to refine your strategy"
        },
        {
            icon: Cloud,
            title: "Customizable Twitch Bot",
            description: "Enhance viewer interaction with a fully customizable Twitch bot that manages chat, commands, and more"
        },
    ];

    return (
        <div className="relative bg-gradient-to-r from-indigo-900 via-gray-800 to-gray-900 py-32 px-8 rounded-b-lg overflow-hidden">
            <div className="max-w-6xl mx-auto mb-12">
                <h2 className="text-4xl font-bold text-white text-left">Our Features</h2>
                <p className="text-xl text-gray-300 text-left mt-4">
                    Explore the powerful tools we provide to elevate your streaming experience.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturesSection;
