import { create } from 'zustand';

interface LoginParams {
  captcha: string;
  checkKey?: string;
  password: string;
  rememberMe?: string;
  username: string;
}

const useUserStore = create((set) => ({
  username: '',
  tenant_id: 0,
  token: '',
  userInfo: {},
  roleList: [],
  showLoginModal: false,
  loginAction: async (params: LoginParams) => {},
  logout: async () => {},
}));
export default useUserStore;
