import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('About 组件挂载');
    return () => {
      console.log('About 组件卸载 (或缓存)');
    };
  }, []);
  return (
    <>
      <div className="bg-green-800 h-[100vh]">
        count: {count}
        <div className=" ">about page</div>
        <Button variant="contained" onClick={() => navigate('/')}>
          to home page
        </Button>
        <Button variant="contained" onClick={() => setCount(count + 1)}>
          add Count
        </Button>
      </div>
    </>
  );
};
export default AboutPage;
