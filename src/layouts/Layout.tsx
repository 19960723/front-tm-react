import { Outlet } from 'react-router-dom';
import LayoutHeader from './Header';
import LayoutFooter from './Footer';

const Layout = () => {
  return (
    <div className="custom_container">
      <LayoutHeader />
      <Outlet />
      <LayoutFooter />
    </div>
  );
};
export default Layout;
