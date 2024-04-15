import { useQueryClient } from "@tanstack/react-query";

interface CacheDataType<T> {
  data: T;
}

const useCachedData = <T,>(queryKey: string): T => {
  const qc = useQueryClient();
  const cachedData = qc.getQueryData([queryKey]) as CacheDataType<T>;
  return cachedData?.data;
};

// const foo = <T,>(x: T) => x;
// const foo = <T extends unknown>(x: T) => x;

export default useCachedData;
