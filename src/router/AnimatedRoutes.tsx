// AnimatedRoutes.tsx
import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
// import { CSSTransition, TransitionGroup } from 'react-transition-group';
import KeepAlive from 'react-activation';
import Loading from '../components/Loading';
import { routeList, RouteItem } from './routeConfig';
import '../styles/RouteAnimations.css';

// 递归渲染路由
const renderRoutes = (routes: RouteItem[]) =>
  routes.map(({ path, element: Element, keepAlive, cacheKey, children }) => {
    const node = keepAlive ? (
      <KeepAlive cacheKey={cacheKey || path}>
        <Element />
      </KeepAlive>
    ) : (
      <Element />
    );

    return (
      <Route key={path} path={path} element={node}>
        {children && renderRoutes(children)}
      </Route>
    );
  });

const AnimatedRoutes = () => {
  const location = useLocation();
  // const nodeRef = useRef<HTMLDivElement>(null);
  // const currentRoute = routeList.find((r) => r.path === location.pathname);
  // const animation = currentRoute?.animation || '';

  return (
    <Suspense fallback={<Loading />}>
      {/* <TransitionGroup component={null}>
        <CSSTransition key={location.pathname} classNames={animation} timeout={300} nodeRef={nodeRef} appear>
          <div ref={nodeRef} className="route-wrapper"> */}
      <Routes location={location}>{renderRoutes(routeList)}</Routes>
      {/* </div>
        </CSSTransition>
      </TransitionGroup> */}
    </Suspense>
  );
};

export default AnimatedRoutes;
