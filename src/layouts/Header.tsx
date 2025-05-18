import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { TextField, Box, InputAdornment, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Search from '@mui/icons-material/Search';
import { useGetRandomImage } from '@/api/index';
import { useLoginHandler } from '@/api/user';
import useUserStore from '@/store';

const LoginModalComponent = () => {
  const [open, setOpen] = useState(false); // 控制对话框的显示与隐藏
  const [username, setUsername] = useState(''); // 存储账号输入
  const [password, setPassword] = useState(''); // 存储密码输入
  const [captcha, setCaptcha] = useState(''); // 存储验证码
  const [checkKey, setCheckKey] = useState<number | string>(''); // 存储验证码
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const { loginAction } = useUserStore();

  // 点击登录按钮打开对话框
  const handleClickOpen = () => {
    setOpen(true);
    // getRandomImageFn();
    setUsernameError('');
    setPasswordError('');
    setCaptchaError('');
  };
  // 点击取消或对话框外部关闭对话框
  const handleClose = () => {
    setOpen(false);
    setUsername(''); // 关闭时清空账号
    setPassword(''); // 关闭时清空密码
    setCaptcha('');
    setUsernameError('');
    setPasswordError('');
    setCaptchaError('');
  };

  // 处理账号输入变化
  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value);
    setUsernameError(''); // 输入时清除错误提示
  };
  // 处理密码输入变化
  const handlePasswordChange = (event: any) => {
    setPassword(event.target.value);
    setPasswordError(''); // 输入时清除错误提示
  };
  // 处理验证码输入变化
  const handleCaptchaChange = (event: any) => {
    setCaptcha(event.target.value);
    setCaptchaError(''); // 输入时清除错误提示
  };
  const validateForm = () => {
    let isValid = true;
    setUsernameError(username ? '' : '账号不能为空');
    setPasswordError(password ? '' : '密码不能为空');
    setCaptchaError(captcha ? '' : '验证码不能为空');

    if (!username) isValid = false;
    if (!password) isValid = false;
    if (!captcha) isValid = false;

    return isValid;
  };

  const { getRandomImage, response: captchaImage } = useGetRandomImage();
  const getRandomImageFn = () => {
    const NewCheckKey = new Date().getTime();
    setCheckKey(NewCheckKey);
    getRandomImage(`/sys/randomImage/${NewCheckKey}`, {});
  };
  // 处理登录逻辑
  const { login: loginApiHandler } = useLoginHandler();
  const handleLogin = async () => {
    if (validateForm()) {
      // 在这里处理你的登录逻辑，例如发送 API 请求进行身份验证
      console.log('登录账号:', username, '密码:', password, '验证码:', captcha, 'checkKey', checkKey);
      // 登录成功后可以关闭对话框或者进行其他操作

      loginApiHandler({
        username,
        password,
        captcha,
        checkKey,
      });

      handleClose();
    }
  };
  useEffect(() => {
    getRandomImageFn();
  }, []);
  return (
    <div>
      <div className="custom_login_button" onClick={handleClickOpen}>
        登录
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>账号密码登录</DialogTitle>
        <DialogContent sx={{ width: '400px' }}>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            placeholder="请输入账号"
            type="text"
            fullWidth
            variant="outlined"
            value={username}
            size="small"
            onChange={handleUsernameChange}
            error={!!usernameError}
            helperText={usernameError}
          />
          <TextField
            margin="dense"
            id="password"
            placeholder="请输入密码"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            size="small"
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleLogin();
              }
            }}
          />
          <Box className="flex">
            <TextField
              margin="dense"
              placeholder="请输入验证码"
              className="flex1"
              variant="outlined"
              value={captcha}
              size="small"
              onChange={handleCaptchaChange}
              error={!!captchaError}
              helperText={captchaError}
            />
            <img className="ml-5 w-[160px] cursor-pointer" src={captchaImage} onClick={getRandomImageFn} alt="" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '8px 24px 20px 24px' }}>
          <Button variant="contained" className="w-full" sx={{ backgroundColor: '#e6a23c' }} onClick={handleLogin}>
            登录
          </Button>
        </DialogActions>
        {/* <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleLogin}>登录</Button>
        </DialogActions> */}
      </Dialog>
    </div>
  );
};

const LayoutHeader = () => {
  const header_menu = [
    { label: '资讯', path: '/' },
    { label: '论坛', path: '/forum' },
  ];
  const token = '';
  return (
    <div className="md:h-16 bg-white shadow flex justify-center sticky top-0 z-10">
      <div className="flex justify-between items-center w-full md:w-[1200px] 2xl:w-[1400px]">
        <div className="flex items-center">
          <div className="bg-active text-white w-20 h-10 font-semibold flex justify-center items-center">LOGO</div>
          <div className="flex justify-center items-center h-full text-primary">
            {header_menu.map((v) => (
              <NavLink
                to={v.path}
                key={v.path}
                className={({ isActive }) => clsx('mx-8 hover:text-active focus:text-active', { 'text-active font-semibold': isActive })}
              >
                {v.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="请输入关键词搜索"
              className="custom_input w-[260px] rounded-[40px]"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '30px',
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <div className="ml-5">
            {!token ? (
              // <div className="custom_login_button">登录</div>
              <LoginModalComponent />
            ) : (
              <div className="flex flex-col items-center">
                <Avatar alt="Remy Sharp" sx={{ width: 30, height: 30 }} src="/static/images/avatar/1.jpg" />
                <span className="mt-1 text-[12px] text-primary">林小龙</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LayoutHeader;
