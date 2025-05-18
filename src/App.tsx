// // import { useState } from 'react';
// // import reactLogo from './assets/react.svg';
// // import viteLogo from '/vite.svg';
// // import './App.css';
// import { Button } from '@mui/material';
// // import { useSnackbar } from './contexts/SnackbarContext';
// import { useState, useEffect } from 'react';
// import AppRouter from './router/index';

// function App() {
//   const [count, setCount] = useState(0);
//   // useEffect(() => {
//   //   let timer = setInterval(() => {
//   //     setCount(count + 1);
//   //   }, 1000);

//   //   return () => clearInterval(timer);
//   // }, [count]);

//   // const { showSnackbar } = useSnackbar();
//   const testApiRequest = () => {
//     console.log('请求数据');
//     // showSnackbar('请求出错，尝试重新请求！', 'success', 4000);
//   };
//   console.log('请求数据');
//   return (
//     <>
//       <AppRouter />
//       <div>
//         {/* <Button variant="contained" className="text-left" onClick={() => testApiRequest()}>
//           Api 请求
//         </Button> */}

//         {/* <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a> */}
//       </div>
//       {/* <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count: number) => count + 1)}>count is {count}</button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">Click on the Vite and React logos to learn more</p> */}
//     </>
//   );
// }
// import { useState, useEffect } from 'react';

import AppRouter from './router/index';
import './styles/global.css';
function App() {
  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
