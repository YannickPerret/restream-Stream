'use client';
import AuthApi from "../../../api/auth";
import { useSessionStore } from "../../../stores/useSessionStore";
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";

export default function LogoutForm() {
  const { logout } = useSessionStore.getState()
  const  router = useRouter();


  const handleLogout = async(e) => {
    e.preventDefault();
    try {
      await AuthApi.logout().then(() => {
        logout();
        router.push('/');
        router.refresh();
      })
    } catch (error) {
      console.error('Logout error', error);
    }
  }
  return (
    <button
      type="button"
      className="flex text-xl gap-2 p-2 text-white hover:bg-gray-700 rounded-md align-baseline"
      onClick={handleLogout}
    >
      <LogOut /> Logout
    </button>
  )
}