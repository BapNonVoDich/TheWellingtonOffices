// src/app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth"

// Destructure va export ham GET, POST mot cach rieng le tu object 'handlers'
export const { GET, POST } = handlers