import ProvidersCreateForm from "@/components/forms/provider";

export default function ProvidersCreate () {
    return (
        <section className={"bg-white p-8 text-black flex flex-col"}>
            <header>
                <h1>Providers Create</h1>
            </header>

            <div>
                <ProvidersCreateForm />
            </div>

        </section>
    )
}