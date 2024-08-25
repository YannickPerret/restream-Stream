import PriceList from "#components/priceList/PriceList.jsx";
import Testimonial from "#components/testimonial/Testimonial.jsx";
import imageTestimonial from '#public/testimonial.avif';
import TrustLogos from "#components/trustLogo/TrustLogo.jsx";
import BackgroundSection from "#components/backgroundSection/BackgroundSection.jsx";
import FeaturesSection from "#components/feature/FeatureSection.jsx";
import HeroSection from "#components/hero/Hero.jsx";
import Newsletter from "#components/newsletter/Newsletter.jsx";

export default function Home() {
    return (
        <>
            <section className="flex flex-col w-full ">
                <HeroSection />
            </section>

            <section className="flex flex-col  w-full max-w-8xl" id={"features"}>
                <FeaturesSection />
            </section>

            <section className="relative w-full max-w-6xl mx-auto overflow-visible my-36 py-24">
                <Testimonial
                    imageSrc={imageTestimonial}
                    imageAlt="Judith Black"
                    quote="This platform has completely transformed the way I manage my content. The ability to stream 24/7 and keep my audience engaged with automated reruns is a game-changer. My viewer count and revenue have significantly increased since I started using it. I can't imagine going back to the old way of doing things."
                    author="Tamara Loup"
                    role="Stream Content Manager"
                />
            </section>

            <section className="flex flex-col bg-amber-50 w-full max-w-8xl">
                <PriceList />
            </section>

            <BackgroundSection>
                &nbsp;
            </BackgroundSection>

            <section className="flex flex-col bg-amber-50 w-full max-w-8xl">
                <TrustLogos />
            </section>

            <section className="flex flex-col w-full max-w-8xl">
                <Newsletter />
            </section>


        </>
    );
}
