// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Mở rộng type của module 'next-auth'
declare module 'next-auth' {
  /**
   * Mở rộng interface Session để thêm vào các thuộc tính tùy chỉnh
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user']; // Giữ lại các thuộc tính mặc định như name, email, image
  }

  /**
   * Mở rộng interface User mặc định
   */
  interface User extends DefaultUser {
    role: string;
  }
}

// Mở rộng type của JSON Web Token
declare module 'next-auth/jwt' {
  interface JWT {
    role: string ;
    id: string | undefined;
  }
}