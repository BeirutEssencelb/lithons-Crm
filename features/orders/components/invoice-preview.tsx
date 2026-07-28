import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { COMPANY_NAME, COMPANY_ADDRESS } from "@/lib/constants";
import type { PrintableInvoice } from "@/features/orders/types/order.types";

interface InvoicePreviewProps {
  invoice: PrintableInvoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <Card className="max-w-3xl mx-auto print:shadow-none print:border-none">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">INVOICE</CardTitle>
            <p className="text-sm text-muted-foreground">
              #{invoice.invoice_number}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{COMPANY_NAME}</p>
            <p className="text-muted-foreground">{COMPANY_ADDRESS}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bill To */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-1">Bill To:</p>
            <p>{invoice.to.name}</p>
            {invoice.to.company && <p>{invoice.to.company}</p>}
            <p>{invoice.to.email}</p>
            {invoice.to.address && <p>{invoice.to.address}</p>}
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Issued:</span>{" "}
              {formatDate(invoice.issued_at)}
            </p>
            {invoice.due_at && (
              <p>
                <span className="font-semibold">Due:</span>{" "}
                {formatDate(invoice.due_at)}
              </p>
            )}
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {invoice.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Product</th>
              <th className="text-left py-2">SKU</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.product_name}</td>
                <td className="py-2 text-muted-foreground">{item.sku}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
