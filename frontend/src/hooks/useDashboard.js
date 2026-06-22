import { useQuery } from "@tanstack/react-query";
import * as dashboardApi from "../api/dashboardApi";

/** Thống kê tổng quan (KPI, đơn theo trạng thái, doanh thu). */
export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardApi.getSummary,
    staleTime: 30 * 1000,
  });

/** Top món bán chạy. */
export const useTopProducts = (limit = 10) =>
  useQuery({
    queryKey: ["dashboard", "top-products", limit],
    queryFn: () => dashboardApi.getTopProducts({ limit }),
    staleTime: 30 * 1000,
  });
