import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import DouyinScroll from './components/Slide/index';
const MoviesPage = () => {
  const prevHandler = () => {};
  const nextHandler = () => {};
  return (
    <div className="w-full h-screen flex bg-[#161823]">
      <div className="flex-1">
        <DouyinScroll />
      </div>
      <div className="w-[75px] h-full hidden sm:block">
        <div className="w-full h-full flex justify-center items-center">
          <div className="opacity-70 w-[36px] h-[80px] bg-[#33343f] rounded-[18px] flex flex-col text-[#8f8f95] size-[24px]">
            <Box className="flex-1 text-center cursor-pointer hover:text-white leading-[40px]">
              <ExpandLessIcon onClick={prevHandler} sx={{ fontSize: '26px' }} />
            </Box>
            <Box className="flex-1 text-center cursor-pointer hover:text-white leading-[40px]">
              <ExpandMoreIcon onClick={nextHandler} sx={{ fontSize: '26px' }} />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MoviesPage;
