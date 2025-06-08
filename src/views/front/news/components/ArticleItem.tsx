import { Box, Typography, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import ClockIcon from '@mui/icons-material/AccessTime';
import ViewIcon from '@mui/icons-material/Visibility';
import dayjs from 'dayjs';
import { getFileAccessHttpUrl } from '@/api';

interface ArticleItemProps {
  item: {
    id: string;
    title: string;
    addTime: string;
    hits?: number;
    intro?: string | null;
    content?: string | null;
    coverPhoto: string;
  };
}
export default function ArticleItem({ item }: ArticleItemProps) {
  return (
    <Box key={item.id} className="flex overflow-hidden p-5 bdb">
      <Box className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <Link to={`/newsDetail/${item.id}`} className="text-lg leading-9 font-semibold cursor-pointer hover:text-active">
            {item.title}
          </Link>
          <Stack direction="row" alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
            <Stack direction="row" alignItems="center" mr={3}>
              <ClockIcon sx={{ mr: 0.5, fontSize: 16 }} />
              <Typography variant="caption">{dayjs(item.addTime).format('YYYY-MM-DD HH:mm')}</Typography>
            </Stack>
            {item.hits !== undefined && (
              <Stack direction="row" alignItems="center">
                <ViewIcon sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="caption">{item.hits}</Typography>
              </Stack>
            )}
          </Stack>
        </div>
        <Typography
          variant="body2"
          className="text_two text-sm text-primary_text"
          dangerouslySetInnerHTML={{ __html: item.intro || item.content || '' }}
        />
      </Box>
      <Box className="w-[120px] h-[80px] ml-8">
        <img src={getFileAccessHttpUrl(item.coverPhoto)} alt={item.title} className="w-full h-full rounded-lg cursor-pointer" />
      </Box>
    </Box>
  );
}
