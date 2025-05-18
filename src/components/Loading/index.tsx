import './Loading.css'; // 可以创建一个单独的 CSS 文件来定义加载动画样式

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
      <p className="loading-text">加载中...</p>
    </div>
  );
};

export default Loading;
