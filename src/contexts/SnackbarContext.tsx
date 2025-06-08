import React, { useState, useCallback, createContext, useContext } from 'react';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';

interface CustomSnackbarProps extends SnackbarProps {
  severity?: AlertProps['severity'];
  message?: React.ReactNode;
  autoHideDuration?: number;
  onClose: (event: React.SyntheticEvent | Event | null, reason?: string) => void;
}
// variant="filled"
const Alert = (props: AlertProps) => <MuiAlert elevation={6} {...props} />;

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ open, onClose, severity = 'info', message, autoHideDuration = 6000, ...other }) => {
  const handleClose = useCallback(
    (event: React.SyntheticEvent | Event | null, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      onClose(event, reason);
    },
    [onClose]
  );

  const action = (
    <>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        {/* <CloseIcon fontSize="small" /> */}
      </IconButton>
    </>
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      key={message} // 使用 message 作为 key，强制更新
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      message={message}
      action={action}
      {...other}
    >
      {/* onClose={handleClose}  */}
      <Alert severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

interface SnackbarContextValue {
  showSnackbar: (message: React.ReactNode, severity?: AlertProps['severity'], duration?: number) => void;
  closeSnackbar: (event: React.SyntheticEvent | Event | null, reason?: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<React.ReactNode>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertProps['severity']>('info');
  const [autoHideDuration, setAutoHideDuration] = useState(6000);

  const showSnackbar = useCallback((message: React.ReactNode, severity: AlertProps['severity'] = 'info', duration: number = 6000) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setAutoHideDuration(duration);
    setSnackbarOpen(true);
  }, []);

  const closeSnackbar = useCallback((event: React.SyntheticEvent | Event | null, reason?: string) => {
    console.log(event);
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      <CustomSnackbar
        open={snackbarOpen}
        onClose={closeSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        autoHideDuration={autoHideDuration}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
