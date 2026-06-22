import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as orderApi from "../api/orderApi";

/** Danh sách đơn của khách (phân trang, lọc trạng thái). Giữ NGUYÊN body có pagination. */
export const useMyOrders = (params) =>
  useQuery({
    queryKey: ["my-orders", params],
    queryFn: () => orderApi.getMyOrders(params),
    placeholderData: keepPreviousData,
  });

/** Chi tiết / theo dõi 1 đơn. */
export const useOrder = (id) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  });

/** Tạo đơn (F3). Sau khi đặt: làm mới danh sách đơn & trạng thái bàn. */
export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

/** Sửa đơn (F4) — chỉ khi pending. */
export const useUpdateOrder = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orderApi.updateOrder(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(["order", id], data);
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

/** Khách tự huỷ đơn (F4) — chỉ khi pending. */
export const useCancelOrder = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => orderApi.cancelOrder(id),
    onSuccess: (data) => {
      qc.setQueryData(["order", id], data);
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};
