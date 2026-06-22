import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as orderApi from "../api/orderApi";

/** Tạo đơn (F3). Sau khi đặt: làm mới danh sách đơn & trạng thái bàn. */
export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};
