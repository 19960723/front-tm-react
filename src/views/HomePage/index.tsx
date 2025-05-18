import { Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNewsLabelList } from '../../api/index';
import { useVideoList } from '../../api/movies';
import React, { useEffect } from 'react';

const HomePage = () => {
  const navigate = useNavigate();

  const toAboutPage = () => {
    navigate('/about?id=222&token=kkk', { state: { id: 123, token: 'asd' } });
  };
  const { getNewsLabel, response: label_list, loading: label_list_loading } = useNewsLabelList();
  const testApiRequestHandler = () => {
    getNewsLabel({});
  };

  const { getList: getVideoList } = useVideoList();
  const getVideoListFn = () => {
    getVideoList({});
  };
  useEffect(() => {
    testApiRequestHandler();
  }, []);
  return (
    <>
      <div className="bg-red-200 w-full h-[100vh]">
        <div className="boxClass ">home page</div>
        <Button variant="contained" onClick={toAboutPage}>
          to about page
        </Button>
        <Button variant="contained" onClick={getVideoListFn}>
          test Api Request
        </Button>
        {label_list_loading
          ? Array.from(Array(5)).map((_, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center mb-4">
                  <Skeleton variant="rounded" width={24} height={24} />
                  <Skeleton sx={{ ml: 1 }} key={index} height={25} width={30 + Math.random() * 40 + '%'} />
                </div>
              </React.Fragment>
            ))
          : label_list?.map((v: any) => <div key={v.id}>{v.name}</div>)}
      </div>
    </>
  );
};
export default HomePage;
