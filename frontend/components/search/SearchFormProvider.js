export default function SearchFormProvider({ provider }) {
    return (
        <div>
            {provider.type} - {provider.name} - {provider.streamKey} - Diffuse on : {provider.onPrimary}
        </div>
    );
}