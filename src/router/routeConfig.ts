// routeConfig.ts
import { lazy } from 'react';

export interface RouteItem {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>>;
  animation?: string; // fade slide zoom
  keepAlive: boolean;
  cacheKey?: string;
  children?: RouteItem[]; // 若后续需要支持嵌套路由
}

export const routeList: RouteItem[] = [
  {
    path: '/',
    element: lazy(() => import('../layouts/Layout')),
    animation: '',
    keepAlive: false,
    children: [
      {
        path: '',
        element: lazy(() => import('../views/front/news')),
        animation: '',
        keepAlive: false,
      },
      {
        path: 'newsDetail/:id',
        element: lazy(() => import('../views/front/news/detail')),
        animation: '',
        keepAlive: false,
      },
      {
        path: 'forum',
        element: lazy(() => import('../views/front/forum')),
        animation: '',
        keepAlive: false,
      },

      {
        path: 'planet',
        element: lazy(() => import('../views/front/planet')),
        animation: '',
        keepAlive: false,
      },
    ],
  },
  {
    path: '/movies',
    element: lazy(() => import('../views/movies')),
    animation: '',
    keepAlive: false,
    cacheKey: 'Movies',
  },

  {
    path: '/home',
    element: lazy(() => import('../views/HomePage')),
    animation: '',
    keepAlive: false,
    cacheKey: 'Home',
  },

  {
    path: '/about',
    element: lazy(() => import('../views/About')),
    animation: '',
    keepAlive: false,
    cacheKey: 'About',
  },
  {
    path: '*',
    element: lazy(() => import('../views/NotFoundPage')),
    animation: '',
    keepAlive: false,
  },
];
