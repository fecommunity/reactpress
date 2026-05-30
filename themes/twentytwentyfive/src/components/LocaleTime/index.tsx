import dateFormat from 'date-fns/format';
import distanceInWords from 'date-fns/formatDistance';
import zh from 'date-fns/locale/zh-CN';
import React, { useEffect, useRef, useState } from 'react';

let callbacks = [];

setInterval(() => {
  callbacks.forEach((cb) => cb());
}, 1000 * 60);

function eachMinute(fn) {
  callbacks.push(fn);

  return () => {
    callbacks = callbacks.filter((cb) => cb !== fn);
  };
}

type Props = {
  date: string | number | Date;
  format?: string;
  timeago?: boolean;
};

const getTimeago = (date) => {
  let content = distanceInWords(new Date(date), new Date(), {
    addSuffix: true,
    locale: zh,
  });

  content = content.replace('about', '').replace('less than a minute ago', 'just now').replace('minute', 'min');

  return content;
};

export const LocaleTime: React.FC<Props> = ({ date, timeago, format = 'yyyy-MM-dd HH:mm:ss' }) => {
  const [mounted, setMinutesMounted] = useState(0);
  const callback = useRef<() => void>();

  useEffect(() => {
    setMinutesMounted(1);
    callback.current = eachMinute(() => {
      setMinutesMounted((state) => state + 1);
    });

    return () => {
      if (callback.current) {
        callback.current();
      }
    };
  }, []);

  const formated = dateFormat(new Date(date), format);
  const showTimeago = Boolean(timeago && mounted);

  return <time dateTime={formated} suppressHydrationWarning={Boolean(timeago)}>{showTimeago ? getTimeago(date) : formated}</time>;
};
