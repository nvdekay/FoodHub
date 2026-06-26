import { useInfiniteQuery, useQuery, keepPreviousData } from "@tanstack/react-query";
import * as categoryApi from "../api/categoryApi";
import * as productApi from "../api/productApi";

export const useCategories = (params) =>
  useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryApi.getCategories(params),
    staleTime: 5 * 60 * 1000,
  });

export const useProducts = (params) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => productApi.getProducts(params),
    placeholderData: keepPreviousData,
  });

/**
 * Danh sách sản phẩm phân trang nối tiếp (infinite scroll) cho trang thực đơn.
 * Mỗi trang là body { data, pagination }; tự dừng khi đã tải hết các trang.
 */
export const useInfiniteProducts = (params) =>
  useInfiniteQuery({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam }) => productApi.getProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage?.pagination || {};
      return page && totalPages && page < totalPages ? page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  });
