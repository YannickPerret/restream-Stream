import ProvidersCreateForm from "#components/forms/create/provider.js";

export default function ProvidersCreate () {
    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <div className="container mx-auto">
                    <h1 className="text-3xl text-white py-4 ">Providers Create</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </div>

                <div>
                    <ProvidersCreateForm/>
                </div>
            </div>

        </section>
    )
}