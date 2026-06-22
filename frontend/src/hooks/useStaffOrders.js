import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as orderApi from "../api/orderApi";

/** Danh sách tất cả đơn (NV) — phân trang, lọc trạng thái/bàn/ngày. */
export const useStaffOrders = (params) =>
  useQuery({
    queryKey: ["staff-orders", params],
    queryFn: () => orderApi.listOrders(params),
    placeholderData: keepPreviousData,
  });

// Mutation dùng chung: làm mới danh sách đơn, dashboard & cache đơn chi tiết.
const useOrderMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["staff-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (data?._id) qc.setQueryData(["order", data._id], data);
    },
  });
};

/** Xác nhận đơn — discountAmount tuỳ chọn. */
export const useConfirmOrder = () =>
  useOrderMutation(({ id, discountAmount }) =>
    orderApi.confirmOrder(
      id,
      discountAmount !== undefined && discountAmount !== "" && discountAmount !== null
        ? { discountAmount: Number(discountAmount) }
        : {}
    )
  );

/** Chuyển trạng thái chế biến (preparing/ready/completed). */
export const useSetOrderStatus = () =>
  useOrderMutation(({ id, status }) => orderApi.setOrderStatus(id, status));

/** Nhân viên huỷ đơn (kèm lý do). */
export const useCancelOrderStaff = () =>
  useOrderMutation(({ id, cancelReason }) => orderApi.cancelOrderByStaff(id, cancelReason));

/** Cập nhật thanh toán. */
export const useUpdatePayment = () =>
  useOrderMutation(({ id, ...payload }) => orderApi.updatePayment(id, payload));
