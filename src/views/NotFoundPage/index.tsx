import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404 - 找不到页面</h1>
      <p style={styles.message}>您访问的页面不存在。</p>
      <p style={styles.link}>
        <Link to="/">返回首页</Link>
      </p>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  message: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  link: {
    fontSize: '1rem',
  },
  linkA: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default NotFoundPage;
