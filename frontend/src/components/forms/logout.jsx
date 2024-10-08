'use client';
import AuthApi from "../../../api/auth";
import { useAuthStore } from "#stores/useAuthStore.js";
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";

export default function LogoutForm() {
  const { logout } = useAuthStore()
  const  router = useRouter();


  const handleLogout = async(e) => {
    e.preventDefault();
   try {
       await AuthApi.logout().then(() => {
        router.push('/');
        router.refresh();
      })
    } catch (error) {
      console.error('Logout error', error);
    }
      logout();
  }
  return (
    <button
      type="button"
      className="flex gap-2 p-2 text-white hover:bg-gray-700 rounded-md align-baseline text-white bg-purple-600 rounded-lg px-4 py-2 ml-4 hover:bg-purple-700 transition-all duration-300"
      onClick={handleLogout}
    >
      <LogOut /> Logout
    </button>
  )
}