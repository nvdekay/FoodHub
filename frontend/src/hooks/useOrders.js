import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as orderApi from "../api/orderApi";

/**
 * Làm mới mọi cache liên quan tới đơn. Khách & nhân viên xem chung dữ liệu đơn,
 * nên 1 thao tác của khách phải đồng bộ cả danh sách phía NV (staff-orders) lẫn
 * dashboard, tránh NV thao tác trên trạng thái đã cũ.
 */
const invalidateOrderCaches = (qc) => {
  qc.invalidateQueries({ queryKey: ["my-orders"] });
  qc.invalidateQueries({ queryKey: ["staff-orders"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["tables"] });
};

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
      invalidateOrderCaches(qc);
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
      invalidateOrderCaches(qc);
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
      invalidateOrderCaches(qc);
    },
  });
};
