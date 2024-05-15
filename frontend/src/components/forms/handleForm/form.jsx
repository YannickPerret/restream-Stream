export default function Form({title, children, onSubmit, error = undefined}) {
    return (
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                    <h6 className="text-blueGray-700 text-xl font-bold">{title}</h6>
                </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={onSubmit}>
                    {children}
                </form>
            </div>
        </div>

    )
}