export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6f6f6f',
        active: '#e87523',
        white: '#ffffff',
        primary_text: '#999999',
        black: '#000000',
      },
    },
    screens: {
      sm: '640px',
      // 添加一个自定义的断点 'md' 在1200px宽度
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
