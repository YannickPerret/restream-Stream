import {boolenStringFormat} from "#helpers/string.js";
import {useGuestStore} from "#stores/useGuestStore.js";
import Link from "next/link";
import StreamsEditView from "@/views/streams/edit.jsx";
import {useState} from "react";
import GuestsEditView from "@/views/guests/edit.jsx";

export default function GuestIndexView({revok, remove}) {
    const guests = useGuestStore.use.guests()
    const [selectedGuest, setSelectedGuest] = useState(null);

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {selectedGuest && (
                <GuestsEditView
                    guestToEdit={selectedGuest}
                    onClose={() => setSelectedGuest(null)}
                />
            )}
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
                            <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" onClick={() => setSelectedGuest(guest)}>Edit</button>
                            {Number(guest.canDiffuse) ? (
                                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => revok(guest.id, false)}>Revok</button> )
                                : (
                                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => revok(guest.id, true)}>Grant</button>
                                )}
                            <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={() => remove(guest.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}