export default function Form({ title, children, onSubmit, error = undefined }) {
    return (
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    {children}
                </form>
            </div>
        </div>
    );
}