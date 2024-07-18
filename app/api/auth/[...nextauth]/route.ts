// Disclaimer: Code taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import NextAuth from "next-auth";
import { authOptions } from "./auth";

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };