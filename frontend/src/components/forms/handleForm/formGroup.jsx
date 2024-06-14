export default function FormGroup({children, title, type = 'column'}){
    return(
        <div className={`form-group`}>
            <h2 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                {title}
            </h2>
            <div className={`flex flex-wrap ${type === 'row' ? ' flex-row' : 'flex-col'} gap-4`}>
                {children}
            </div>
        </div>
    )
}