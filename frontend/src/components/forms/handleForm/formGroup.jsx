export default function FormGroup({children, title}){
    return(
        <div className="form-group">
            <h2 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                {title}
            </h2>
            <div className="flex flex-wrap">
                {children}
            </div>
        </div>
    )
}