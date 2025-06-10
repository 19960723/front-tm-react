import { Avatar, Button, Box, Menu, MenuItem, Typography } from '@mui/material';
import { useGetNewsCommentList, useAddNewsComment, useEditNewsComment, useDeleteNewsComment } from '@/api/news';
import { useEffect, useState, useRef, FocusEvent, MouseEvent } from 'react';
import clsx from 'clsx';
import './comment.css';
import useUserStore from '@/store/userStore';
import { useSnackbar } from '@/contexts/SnackbarContext';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TextsmsIcon from '@mui/icons-material/Textsms';
import IconButton from '@mui/material/IconButton';
import { formatRelativeTime } from '@/utils/index';

interface commentParams {
  id?: string;
  content?: string;
  pid?: string;
  replyUsername?: string;
}
// 组件 Props 类型
interface CommentInputProps {
  info?: { id?: string | number; createBy_dictText?: string; createBy?: string };
  onSend?: (content: commentParams) => void;
  onClose?: () => void;
}
interface commentProps {
  id: string;
  avatar: string;
  createBy?: string;
  createBy_dictText: string;
  content: string;
  createTime: string;
  isReply?: boolean;
  isMore?: boolean;
  childrenList?: commentProps[];
}
const CustomCommentInput: React.FC<CommentInputProps> = ({ info, onSend, onClose }) => {
  const [inputVal, setInputVal] = useState('');
  const [isFocused, setFucused] = useState(false);
  const [placeholder, setPlaceholder] = useState('理性发言，友好互动');
  const inputRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUserStore();

  const inputHandler = () => {
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

  const cancelHandler = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const sendMessageHandler = () => {
    const content = inputVal.trim();
    if (!content) return;

    // 清空输入框内容
    setInputVal('');
    if (inputRef.current) inputRef.current.innerText = '';

    // 取消 focus 状态与占位符重置
    setFucused(false);
    setPlaceholder(info && info.id ? `回复 ${info.createBy_dictText}` : '理性发言，友好互动');

    let params = {
      content,
    };
    if (info?.id) {
      (params as any).pid = info.id;
      (params as any).replyUsername = info.createBy;
    }

    if (typeof onSend === 'function') {
      onSend(params);
    }
  };

  return (
    <div className="flex">
      <div className="w-[36px] h-[36px]">{(!info || !info.id) && <Avatar sx={{ width: '36px', height: '36px' }} src={userInfo.avatar} />}</div>
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
              <Button size="small" variant="outlined" onClick={cancelHandler}>
                取消
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              disabled={!inputVal}
              sx={{ backgroundColor: '#409eff', marginLeft: '12px' }}
              onClick={sendMessageHandler}
            >
              {info && info.id ? `回复 ${info.createBy_dictText}` : '发送'}
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
};

const CommentMenu = ({ id = '', deleteFn = () => {} }) => {
  const { deleteFn: deleteNewsComment } = useDeleteNewsComment();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  async function deleteHandler() {
    const result = await deleteNewsComment({ id });
    if (result) {
      handleClose();
      deleteFn();
    }
  }

  function handleClose() {
    if (anchorEl && document.contains(anchorEl)) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  }

  function handleClick(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  return (
    <div>
      <IconButton onClick={handleClick} size="small">
        <MoreHorizIcon sx={{ fontSize: '18px' }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={deleteHandler}>删除</MenuItem>
      </Menu>
    </div>
  );
};

const CommentCom = ({ id = '' }) => {
  const [commentList, setCommentList] = useState<commentProps[]>([]);
  const { showSnackbar } = useSnackbar();
  const { token, username } = useUserStore();
  const { getList: getCommentList, response } = useGetNewsCommentList();
  const { postFn: addNewsComment } = useAddNewsComment();
  const { putFn: editNewsComment } = useEditNewsComment();
  useEffect(() => {
    getCommentListFn();
  }, []);
  useEffect(() => {
    console.log('hahaha');
    if (response) {
      const comment_list = response.records || [];
      comment_list.forEach((v: commentProps) => {
        v.isReply = false;
        v.isMore = false;
        if (v.childrenList) {
          v.childrenList.forEach((c: any) => {
            c.isReply = false;
          });
        }
      });
      setCommentList(comment_list);
    }
  }, [response]);
  function getCommentListFn() {
    getCommentList({
      infoId: id,
      pageNo: 1,
      pageSize: 10,
    });
  }

  const sendMessage = (info: commentParams) => {
    submitComment({
      ...info,
    });
  };
  async function submitComment(info: commentParams) {
    const fn = info.id ? editNewsComment : addNewsComment;
    let params = {
      infoId: id,
      ...info,
    };
    const result = await fn(params);
    if (result) {
      getCommentListFn();
      showSnackbar('评论成功', 'success', 3000);
    }
  }
  function deleteFn(index: number, childIndex?: number) {
    setCommentList((list) => {
      const newList = [...list];
      const parent = newList[index];
      if (!parent) return list;

      if (childIndex !== undefined && Array.isArray(parent.childrenList)) {
        parent.childrenList = parent.childrenList.filter((_, i) => i !== childIndex);
        if (parent.childrenList.length === 0) delete parent.childrenList;
      } else {
        newList.splice(index, 1);
      }
      return newList;
    });
    console.log(commentList, 'aaa');
  }
  function replyHandler(comment: commentProps, child?: commentProps) {
    setCommentList((prevList) =>
      prevList.map((item) => {
        const isCurrent = item.id === comment.id;

        return {
          ...item,
          isReply: isCurrent && !child ? !item.isReply : false,
          childrenList: item.childrenList?.map((childItem) => ({
            ...childItem,
            isReply: isCurrent && child?.id === childItem.id ? !childItem.isReply : false,
          })),
        };
      })
    );
  }
  return (
    <div className="bg-white p-[40px] mt-6">
      {token && <CustomCommentInput onSend={sendMessage} />}
      <div className="mt-10">
        {commentList.length ? (
          commentList.map((v: commentProps, index: number) => (
            <div key={v.id} className="comment_item mb-2">
              <div className="flex pt-[10px] pb-[14px]">
                <Avatar src={v.avatar} sx={{ width: '36px', height: '36px' }} />
                <div className="pl-[16px] flex-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[15px] font-bold">{v.createBy_dictText}</div>
                    {v.createBy == username && <CommentMenu id={v.id} deleteFn={() => deleteFn(index)} />}
                  </div>
                  <div className="text-[15px] mt-[4px]">{v.content}</div>
                  <div className="mt-[4px] flex justify-between text-[14px]">
                    <Box sx={{ color: '#9196a1' }}>
                      <span>{formatRelativeTime(v.createTime)}</span>
                      <span></span>
                    </Box>
                    {token && (
                      <Box sx={{ color: '#9196a1' }} className="flex">
                        <span className="flex items-center cursor-pointer" onClick={() => replyHandler(v)}>
                          <TextsmsIcon sx={{ fontSize: '16px' }} />
                          <span className="ml-1">回复</span>
                        </span>
                      </Box>
                    )}
                  </div>
                </div>
              </div>
              {v.isReply && <CustomCommentInput onSend={sendMessage} onClose={() => replyHandler(v)} info={v} />}
              {v.childrenList && v.childrenList.length && (
                <div className="pl-[52px]">
                  {v.childrenList.map((child, childIndex) => (
                    <div key={child.id}>
                      <div className="flex pt-[10px] pb-[14px]">
                        <Avatar src={child.avatar} sx={{ width: '36px', height: '36px' }} />
                        <div className="pl-[16px] flex-1">
                          <div className="flex justify-between items-center">
                            <div className="text-[15px] font-bold">{child.createBy_dictText}</div>
                            <CommentMenu id={child.id} deleteFn={() => deleteFn(index, childIndex)} />
                          </div>
                          <div className="text-[15px] mt-[4px]">{child.content}</div>
                          <div className="mt-[4px] flex justify-between text-[14px]">
                            <Box sx={{ color: '#9196a1' }}>
                              <span>{formatRelativeTime(child.createTime)}</span>
                              <span></span>
                            </Box>
                            {token && (
                              <Box sx={{ color: '#9196a1' }} className="flex">
                                <span className="flex items-center cursor-pointer" onClick={() => replyHandler(v, child)}>
                                  <TextsmsIcon sx={{ fontSize: '16px' }} />
                                  <span className="ml-1">回复</span>
                                </span>
                              </Box>
                            )}
                          </div>
                        </div>
                      </div>
                      {child.isReply && <CustomCommentInput onSend={sendMessage} onClose={() => replyHandler(v, child)} info={child} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" className="text-center">
            暂无数据
          </Typography>
        )}
      </div>
    </div>
  );
};
export default CommentCom;
