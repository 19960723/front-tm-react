import './index.css';
const LoadingCom = ({ isFullScreen = true }) => {
  return (
    <div className={`Loading normal ${isFullScreen ? 'full' : 'inline'}`}>
      <div className="circle blue"></div>
      <div className="circle red"></div>
    </div>
  );
};
export default LoadingCom;
