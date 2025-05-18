import { Avatar, Button, Box } from '@mui/material';
import { useGetNewsCommentList } from '@/api/news';
import { useEffect, useState, useRef, ChangeEvent, FocusEvent } from 'react';
import clsx from 'clsx';
import './comment.css';

// 组件 Props 类型
interface CommentProps {
  info: { id?: string | number; createBy_dictText?: string };
}

const CustomCommentInput: React.FC<CommentProps> = ({ info }) => {
  const [inputVal, setInputVal] = useState('');
  const [isFocused, setFucused] = useState(false);
  const [placeholder, setPlaceholder] = useState('理性发言，友好互动');
  const inputRef = useRef<HTMLDivElement>(null);
  const userInfo: any = {};
  const inputHandler = (event: ChangeEvent<HTMLDivElement>) => {
    // Handle input changes here
    // console.log('Input:', event.target.textContent, '~~', inputRef.current);
    setInputVal(`${inputRef.current?.innerText.trim()}`);
  };

  const focusHandler = () => {
    setPlaceholder('输入评论（Enter 换行， Ctrl + Enter 发送）');
    setFucused(true);
  };

  const blurHandler = (event: FocusEvent<HTMLDivElement>) => {
    if (info && info.id) {
      setPlaceholder(`回复 ${info.createBy_dictText}`);
    } else {
      setPlaceholder(`理性发言，友好互动`);
    }
    if (!event.target.textContent) {
      setFucused(false);
    }
  };
  return (
    <div className="flex">
      {(!info || !info.id) && <Avatar sx={{ width: '36px', height: '36px' }} src={userInfo.avatar} />}
      <div className={clsx('flex-1 custom_text_input ml-[15px]', isFocused && 'isFocused')}>
        <div
          ref={inputRef}
          contentEditable={true}
          data-placeholder={placeholder}
          className="remark_input placeholder"
          onInput={inputHandler}
          onFocus={focusHandler}
          onBlur={blurHandler}
        ></div>
        <Box className="flex justify-end " sx={{ padding: '10px 10px 10px 0' }}>
          <div></div>
          <div>
            {info && info.id && (
              <Button size="small" variant="contained">
                取消
              </Button>
            )}

            <Button size="small" variant="contained" disabled={!Boolean(inputVal)} sx={{ backgroundColor: '#409eff' }}>
              {info && info.id ? `回复 ${info.createBy_dictText}` : '发送'}
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
};

const CommentCom = ({ id = '' }) => {
  const commentInfo = {};
  const { getList: getCommentList, response: data_list } = useGetNewsCommentList();
  useEffect(() => {
    getCommentList({
      infoId: id,
      pageNo: 1,
      pageSize: 10,
    });
  }, []);
  return (
    <div className="bg-white p-[40px] mt-6">
      <CustomCommentInput info={commentInfo} />
      <div className="mt-10">
        {data_list && data_list.records.length ? (
          data_list.records.map((v: any) => (
            <div key={v.id} className="comment_item mb-2">
              <div className="flex pt-[10px] pb-[14px]">
                <Avatar src={v.avatar} sx={{ width: '36px', height: '36px' }} />
                <div className="pl-[16px] flex-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[15px] font-bold">{v.createBy_dictText}</div>
                  </div>
                  <div className="text-[15px] mt-[4px]">{v.content}</div>
                  <div className="mt-[4px] flex justify-between text-[14px]">
                    <Box sx={{ color: '#9196a1' }}>
                      <span>{v.createTime}</span>
                      <span></span>
                    </Box>
                    <Box sx={{ color: '#9196a1' }} className="flex">
                      <span className="flex items-center cursor-pointer"></span>
                    </Box>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <>暂无数据</>
        )}
      </div>
    </div>
  );
};
export default CommentCom;
