import { useState, useEffect, useMemo } from 'react';
import { useNewsLabelList } from '@/api/index';
import clsx from 'clsx';
import HotCom from './components/HotCom';
import ArticleList from './components/ArticleList';

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { getNewsLabel, response: rawLabelList } = useNewsLabelList();
  const label_list = useMemo(() => {
    if (!rawLabelList || !rawLabelList.length) return [];
    const alreadyHasAll = rawLabelList[0]?.id === 0;
    return alreadyHasAll ? rawLabelList : [{ name: '全部', id: 0 }, ...rawLabelList];
  }, [rawLabelList]);
  const getNewsLabelFn = () => {
    getNewsLabel({});
  };

  useEffect(() => {
    getNewsLabelFn();
  }, []);
  interface label_value {
    id: number;
    name?: string;
  }
  return (
    <div className="flex mx-auto mt-[20px] md:w-[1200px] 2xl:w-[1400px]">
      <div className="flex-1 overflow-hidden bg-white">
        <div className="flex items-center leading-[3rem] bdb">
          {label_list &&
            label_list.map((v: label_value, i: number) => (
              <div
                key={i}
                className={clsx('mx-6 cursor-pointer', activeTab === v.id ? 'font-bold text-active' : 'text-primary hover:text-active')}
                onClick={() => setActiveTab(v.id)}
              >
                {v.name}
              </div>
            ))}
        </div>
        <ArticleList labelId={activeTab} />
      </div>
      <div className="w-[320px] ml-[20px]">
        <HotCom />
      </div>
    </div>
  );
};
export default NewsPage;
