import { useQuery } from "@tanstack/react-query";
import * as tableApi from "../api/tableApi";

/** Danh sách bàn (để khách chọn khi đặt món). */
export const useTables = (params) =>
  useQuery({
    queryKey: ["tables", params],
    queryFn: () => tableApi.getTables(params),
    staleTime: 30 * 1000,
  });
