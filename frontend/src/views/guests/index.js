import {boolenStringFormat} from "#helpers/string.js";
import {useGuestStore} from "#stores/useGuestStore.js";
import Link from "next/link";

export default function GuestIndexView({revok, remove, edit}) {
    const guests = useGuestStore.use.guests()
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                    <tr>
                        <th scope="col" className="px-6 py-3">Username</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Display Name</th>
                        <th scope="col" className="px-6 py-3">Telegram</th>
                        <th scope="col" className="px-6 py-3">Can diffuse</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {guests.map(guest => (
                        <tr key={guest.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <Link href={`guests/${guest.id}`}>{guest.username}</Link></th>
                            <td>{guest.email}</td>
                            <td>{guest.displayName}</td>
                            <td>{guest.telegramUsername}</td>
                            <td>{boolenStringFormat(guest.canDiffuse)}</td>
                            <td className="gap-2 ">
                                <button className="text-indigo-600 hover:text-indigo-900" onClick={() => edit(guest.id)}>Edit</button>
                                {guest.canDiffuse ? <button className="text-red-600 hover:text-red-900" onClick={() => revok(guest.id, false)}>Revok</button> :
                                    <button className="text-green-600 hover:text-green-900" onClick={() => revok(guest.id, true)}>Grant</button>}
                                <button className="text-red-600 hover:text-red-900" onClick={() => remove(guest.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}