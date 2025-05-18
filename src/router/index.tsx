// AppRouter.tsx
import { BrowserRouter } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import AnimatedRoutes from './AnimatedRoutes';

const AppRouter = () => (
  <BrowserRouter>
    <AliveScope>
      {/* <ErrorBoundary fallback={<div>出错啦！</div>}> */}
      <AnimatedRoutes />
      {/* </ErrorBoundary> */}
    </AliveScope>
  </BrowserRouter>
);

export default AppRouter;
