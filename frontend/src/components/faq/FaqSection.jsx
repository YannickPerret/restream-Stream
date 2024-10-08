import FAQItem from "#components/faq/FaqItem.jsx";


const FAQSection = () => {
    const faqs = [
        {
            question: "What's the average duration for completing a design project?",
            answer: "Most design projects take between 1 to 2 weeks depending on the complexity.",
        },
        {
            question: "What are the work hours during which your team is available?",
            answer: "Our team is available from 9 AM to 6 PM, Monday through Friday.",
        },
        {
            question: "Do we have regular meetings?",
            answer: "Yes, we hold regular check-in meetings to update you on progress.",
        },
        {
            question: "How do I request designs?",
            answer: "You can request designs via our platform after your project has been set up.",
        },
        {
            question: "How do we work on task assignments, monitoring, and management?",
            answer: "We use project management tools like Trello and Asana for task assignments and monitoring.",
        },
        {
            question: "How many people will I get for my project?",
            answer: "You will have a dedicated Project Manager, a Designer, and a Creative Director focused on your project.",
        },
        {
            question: "I run an agency, can I hire you?",
            answer: "Yes, we work with agencies to provide design services for their clients.",
        },
        {
            question: "What if the design doesn't meet my expectations or preferences?",
            answer: "We offer revisions to ensure the design meets your expectations.",
        },
    ];

    return (
        <section className="bg-gray-900 py-32">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-center text-3xl font-extrabold text-gray-100 mb-10">
                    Answer to your questions
                </h2>
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
