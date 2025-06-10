import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LoginParams {
  captcha: string;
  checkKey?: string;
  password: string;
  rememberMe?: string;
  username: string;
}

interface UserStore {
  username: string;
  token?: string;
  tenant_id: string | number;
  userInfo: Record<string, any>; // 可根据实际类型进一步细化
  roleList: any[]; // 可换成 string[] 或 Role[] 等更具体类型
  showLoginModal: boolean;
  setToken: (token: string) => void;
  setUserName: (username: string) => void;
  setTenantId: (tenant_id: string | number) => void;
  setUserInfo: (user_info: any) => void;
  logout: () => void;
  toggleLoginModal: (status: boolean) => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      username: '',
      tenant_id: 0,
      token: '',
      userInfo: {},
      roleList: [],
      showLoginModal: false,
      setToken: (token) => set({ token }),
      setUserName: (username) => set({ username }),
      setTenantId: (tenant_id) => set({ tenant_id }),
      setUserInfo: (userInfo) => set({ userInfo }),
      logout: () => set({ username: '', tenant_id: 0, token: '', userInfo: {} }),
      toggleLoginModal: (status) => set({ showLoginModal: status }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
