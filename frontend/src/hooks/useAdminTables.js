import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as tableApi from "../api/tableApi";

const useTableMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
};

export const useCreateTable = () => useTableMutation(tableApi.createTable);

export const useUpdateTable = () =>
  useTableMutation(({ id, ...payload }) => tableApi.updateTable(id, payload));

export const useDeleteTable = () => useTableMutation((id) => tableApi.deleteTable(id));
