// components/ConfirmDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = '确认操作',
  content = '你确定要执行这个操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ width: '400px' }}>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: '8px 24px 20px 24px' }}>
        <Button variant="outlined" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant="contained" onClick={onConfirm} color="primary" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
