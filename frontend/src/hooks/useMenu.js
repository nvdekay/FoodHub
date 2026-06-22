import { useQuery, keepPreviousData } from "@tanstack/react-query";
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

export const useProduct = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  });
