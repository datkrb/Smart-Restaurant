export function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
