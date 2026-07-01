import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { OrdersResponse } from "../../types/order";

export function useOrders() {
  return useQuery({
    queryKey: ["me", "orders"],
    queryFn: () => apiClient.get<OrdersResponse>("/me/orders"),
  });
}
