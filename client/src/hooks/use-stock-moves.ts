import { useQuery } from "@tanstack/react-query";
import type { StockMove } from "@shared/schema";

export function useStockMoves() {
  return useQuery<StockMove[]>({
    queryKey: ["/api/stock-moves"],
  });
}
