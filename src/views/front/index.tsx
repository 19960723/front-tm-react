import { Outlet } from 'react-router-dom';
const FrontPage = () => {
  return (
    <>
      <h3>front</h3>
      <Outlet />
    </>
  );
};
export default FrontPage;
