import { signOut } from "next-auth/react"

export default () => <button className="self-center bg-paper-500 hover:bg-paper-600 text-white font-bold py-2 px-4 rounded" onClick={() => signOut()}>Sign out</button>