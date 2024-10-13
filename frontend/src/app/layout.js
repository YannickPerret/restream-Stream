import { Inter } from "next/font/google";
import "../../styles/globals.css";
import Footer from "#components/layout/footer/Footer.jsx";
import Header from "#components/layout/header/Header.jsx";
import TopBanner from "#components/banner/TopBanner.jsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Make VOD stream simply`,
    description: "Coffee-Stream is a platform that allows you to stream your content 24/7. It is a game-changer for content creators who want to keep their audience engaged with automated reruns. Sign up now and start streaming your content today!",
};

export default function RootLayout({ children }) {

    return (
        <html lang="fr">
        <head>
            <style data-fullcalendar/>
        </head>

        <body className={`${inter.className} flex flex-col min-h-screen max-w-screen bg-gray-900`}>
        {/*<TopBanner
            message="🎉🎉 Anouncement Coffee-Stream is finally launched !! 🎉🎉 "
            linkText="Sign-up now !"
            linkUrl="/auth/register"
        />*/}

        <Header />

        <main className="w-full ">
            {children}
        </main>

        <Footer />
        </body>
        </html>
    );
}
