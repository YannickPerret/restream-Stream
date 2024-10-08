import React from 'react';
import FeatureCard from './FeatureCard';
import { Database, Code, Shield, Globe, Server, Cloud } from 'lucide-react';

const FeaturesSection = () => {
    const features = [
        {
            icon: Database,
            title: "Multi-Platform Integration",
            description: "Centralize your content effortlessly by connecting your YouTube, Twitch, Facebook, and TikTok accounts. Manage and broadcast across all platforms from a single dashboard, expanding your reach and impact"
        },
        {
            icon: Code,
            title: "Automated Streaming Schedule",
            description: "Set up and manage a 24/7 streaming schedule with ease. Keep your channel active even when you’re offline, ensuring your content is always live for your audience, maximizing visibility and engagement"
        },
        {
            icon: Shield,
            title: "Continuous Audience Engagement",
            description: "Maintain viewer engagement with automatic reruns of your streams. Maximize your reach and viewer retention by keeping your channel active around the clock, even when you’re not live"
        },
        {
            icon: Globe,
            title: "Revenue Optimization",
            description: "Increase your ad revenue and subscriber count with uninterrupted streams. Ensure a steady flow of income by letting your content generate profits even when you’re not actively streaming"
        },
        {
            icon: Server,
            title: "Advanced Analytics",
            description: "Gain deep insights into viewer behavior, engagement metrics, and growth trends. Refine your strategy with data-driven decisions to optimize your content and expand your audience"
        },
        {
            icon: Cloud,
            title: "Customizable Twitch Bot",
            description: "Boost viewer engagement with a fully customizable Twitch bot that manages chat, commands, and more. Tailor your bot to fit your channel’s unique needs, ensuring a personalized experience for your audience"
        },
    ];

    return (
        <div className="relative py-32 px-8 rounded-b-lg overflow-hidden">
            <div className="max-w-7xl mx-auto mb-12">
                <h2 className="text-4xl font-bold text-white text-left">Our Features</h2>
                <p className="text-xl text-gray-300 text-left mt-4">
                    Explore the powerful tools we provide to elevate your streaming experience.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
