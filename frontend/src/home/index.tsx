import { Link } from "react-router";

export default function Home() {
    const sections = [
        {
            title: "Stay Organized",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vel mauris ut libero malesuada consequat.",
        },
        {
            title: "Track Everything",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut sapien vel mauris viverra malesuada.",
        },
        {
            title: "Built For You",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae arcu quis lacus tincidunt faucibus.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navigation */}
            <header className="border-b border-white/10 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        JOHN
                    </h1>

                    <nav className="flex items-center gap-8">
                        <a
                            href="#features"
                            className="text-gray-300 transition hover:text-white"
                        >
                            Features
                        </a>
                        <a
                            href="#about"
                            className="text-gray-300 transition hover:text-white"
                        >
                            About
                        </a>
                        <a
                            href="#contact"
                            className="text-gray-300 transition hover:text-white"
                        >
                            Contact
                        </a>

                        <Link
                            to="/login"
                            className="rounded-xl bg-blue-600 px-6 py-2 text-lg font-semibold transition hover:bg-blue-500"
                        >
                            App
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="flex min-h-[75vh] items-center">
                <div className="mx-auto max-w-7xl px-6 py-24">
                    <div className="max-w-3xl">
                        <h2 className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl">
                            Personal Finance, But Better.
                        </h2>

                        <p className="mb-10 text-lg text-gray-300 md:text-xl">
                            JOHN is, put simply, an incredibly badass way to keep track of your finances.
                        </p>

                        <div className="flex gap-4">
                            <Link
                                to="/login"
                                className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-500"
                            >
                                Open App
                            </Link>

                            <a
                                href="#features"
                                className="rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold transition hover:border-white/50"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section
                id="features"
                className="mx-auto max-w-7xl px-6 py-24"
            >
                <div className="mb-12 text-center">
                    <h3 className="text-4xl font-bold">
                        Everything you need
                    </h3>
                    <p className="mt-4 text-gray-400">
                        A few reasons you'll enjoy using JOHN.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {sections.map((section) => (
                        <div
                            key={section.title}
                            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-blue-500/40"
                        >
                            <h4 className="mb-4 text-2xl font-semibold">
                                {section.title}
                            </h4>

                            <p className="text-gray-400">
                                {section.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* About */}
            <section
                id="about"
                className="border-y border-white/10 bg-white/5"
            >
                <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                    <h3 className="mb-6 text-4xl font-bold">
                        Designed to stay out of your way
                    </h3>

                    <p className="mx-auto max-w-3xl text-lg text-gray-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Curabitur bibendum, neque nec suscipit luctus, ipsum
                        lacus tristique augue, non efficitur elit odio vitae
                        lacus. Integer pulvinar, lorem at aliquam tempus, elit
                        ipsum gravida augue, vitae aliquet turpis odio sit amet
                        magna.
                    </p>
                </div>
            </section>

            {/* Contact / CTA */}
            <section
                id="contact"
                className="mx-auto max-w-5xl px-6 py-24 text-center"
            >
                <h3 className="mb-6 text-4xl font-bold">
                    Ready to get started?
                </h3>

                <p className="mb-10 text-lg text-gray-400">
                    Sign in and start managing your finances with JOHN.
                </p>

                <Link
                    to="/login"
                    className="inline-block rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold transition hover:bg-blue-500"
                >
                    Launch App
                </Link>
            </section>
        </div>
    );
}