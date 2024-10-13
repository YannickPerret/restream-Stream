import FAQItem from "#components/faq/FaqItem.jsx";


const FAQSection = () => {
    const faqs = [
        {
            question: "How does the platform work for streaming my VODs ?",
            answer: "You can upload your videos directly to the platform, create an automated broadcast schedule, and the platform takes care of streaming your content 24/7 on the platforms of your choice, such as Twitch, YouTube, TikTok, and others.",
        },
        {
            question: "What platforms are compatible with the VOD streaming tool ?",
            answer: "Most tools allow you to stream on major platforms like Twitch, YouTube, and Facebook, as well as emerging platforms like TikTok, depending on the options you choose.",
        },
        {
            question: "Is it possible to set up an automatic broadcast schedule for my VODs ?",
            answer: "Absolutely! You can configure a schedule that automatically rebroadcasts your VODs at specified times without the need to manually start or stop the stream.",
        },
        {
            question: "Can I insert ad breaks or announcements between VODs ?",
            answer: "Yes, certain tools allow you to insert ad breaks or promotional messages between your videos or at defined points during the stream, enabling you to monetize or engage your audience more effectively.",
        },
        {
            question: "Can I customize my rebroadcasts with overlays and messages for my viewers ?",
            answer: "Yes, you can add overlays, alerts, messages, and even dynamic transitions to your rebroadcasts to make your content more interactive and engaging.",
        },
        {
            question: "Can I schedule my streams in advance ?",
            answer: "Yes, you can plan your broadcasts according to your schedule or your audience's preferences by choosing specific times for your content to be rebroadcast.",
        },
        {
            question: "What file formats are supported for uploading my VODs ?",
            answer: "The platform supports the most common video formats such as MP4, MOV, AVI, and more. You can upload directly from your computer or via a URL from platforms like YouTube.",
        },
        {
            question: "Can I stream to multiple platforms simultaneously ?",
            answer: "Yes, the platform allows multistreaming, meaning you can broadcast your VODs to multiple platforms at the same time, such as Twitch, YouTube, and TikTok, expanding your reach.",
        },
        {
            question: "What are the advantages of using this service instead of streaming from home ?",
            answer: "In addition to not needing an expensive and energy-intensive setup running 24/7, you optimize your revenue by reaching a wider audience. You benefit from continuous monetization opportunities thanks to the uninterrupted broadcasting of your content.",
        },
    ];

    return (
        <section className="bg-gray-900 py-32">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-center text-3xl font-extrabold text-gray-100 mb-10">
                    Frequently Asked Questions
                </h2>
                <p>
                    Welcome to our FAQ page. Here you'll find answers to the most common questions about our products and services.
                </p>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
