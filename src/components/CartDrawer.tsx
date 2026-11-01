import React, { useState } from 'react';
import { useCart } from '../graphql/client';
import { useRouter } from '../router/Router';
import { orderService, CustomerOrder } from '../services/orderService';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

export function CartDrawer() {
  const { cartSummary, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, getCartMap } = useCart();
  const { navigate } = useRouter();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    wilaya: 'Pôle Universitaire Koléa',
    address: '',
    notes: '',
  });

  if (!isCartOpen) return null;

  const isPoleUniversitaire = customer.wilaya === 'Pôle Universitaire Koléa';
  const freeShippingThreshold = 6000;
  const progressPercent = Math.min(100, Math.round((cartSummary.subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - cartSummary.subtotal);

  // Delivery cost: 0 DZD for Pôle Universitaire Koléa, or if subtotal >= 6000 DZD, else 500 DZD
  const effectiveShipping = (isPoleUniversitaire || cartSummary.subtotal >= freeShippingThreshold)
    ? 0
    : (cartSummary.subtotal > 0 ? 500 : 0);

  const effectiveTotal = cartSummary.subtotal + effectiveShipping;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setSubmissionError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const cartMap = getCartMap();
      // Requirement 3 & 11: Validates authoritative prices and saves persistent order to Firestore
      const savedOrder = await orderService.submitOrder(customer, cartMap);

      setConfirmedOrder(savedOrder);
      // Requirement 7: Clear the cart only after successful order creation in the database
      clearCart();
      // Requirement 4: Only show "Order Confirmed" after the database confirms that the order was saved
      setCheckoutStep('success');
    } catch (err: any) {
      console.error('Order submission failed:', err);
      // Requirement 5: If saving fails, display an understandable error and preserve the cart so the customer can retry
      let message = 'Unable to save your order to the database. Your shopping bag is preserved—please try again.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error) {
          message = `Database Error: ${parsed.error}`;
        }
      } catch {
        if (err?.message) {
          message = err.message;
        }
      }
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setConfirmedOrder(null);
    setCheckoutStep('cart');
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting) {
            setIsCartOpen(false);
            if (checkoutStep === 'success') handleFinish();
          }
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-200/80 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 className="text-base font-semibold text-stone-900">
                {checkoutStep === 'cart' && 'Your Shopping Bag'}
                {checkoutStep === 'checkout' && 'Express Order Confirmation'}
                {checkoutStep === 'success' && 'Order Confirmed & Saved'}
              </h2>
            </div>
            <button
              disabled={isSubmitting}
              onClick={() => {
                setIsCartOpen(false);
                if (checkoutStep === 'success') handleFinish();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {checkoutStep === 'cart' && (
              <>
                {/* Free delivery indicator */}
                <div className="p-3.5 bg-stone-100 rounded-lg border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-700">
                    <span className="font-medium">
                      {amountNeeded === 0
                        ? '🎉 You unlocked Free Delivery nationwide!'
                        : `Add ${amountNeeded.toLocaleString()} DZD more for Free Delivery`}
                    </span>
                    <span className="font-mono tabular-nums">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-stone-900 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                {cartSummary.items.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-stone-900 font-medium text-base">Your bag is currently empty</p>
                      <p className="text-xs text-stone-500">
                        Explore our botanical formulations crafted in Koléa
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/products');
                      }}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors inline-block cursor-pointer shadow-xs"
                    >
                      Browse All Products
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-200 space-y-4">
                    {cartSummary.items.map(({ product, quantity, lineTotal }) => {
                      const stockQty =
                        typeof product.stockQuantity === 'number'
                          ? product.stockQuantity
                          : product.inStock
                          ? 25
                          : 0;
                      const isMaxStockReached = quantity >= stockQty;

                      return (
                        <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-18 h-18 object-cover rounded-md border border-stone-200/80 bg-stone-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-medium text-stone-900 leading-snug line-clamp-2">
                                  {product.title}
                                </h3>
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1 flex-wrap">
                                <span>{product.volume}</span>
                                <span aria-hidden="true" className="text-stone-300">·</span>
                                <span className={`font-mono text-[11px] font-medium flex items-center gap-1 ${
                                  stockQty <= 5 ? 'text-amber-700' : 'text-emerald-700'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${stockQty <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                  <span>{stockQty} pieces rest in stock</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 gap-2">
                              {/* Quantity buttons */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-stone-300 rounded-md bg-white">
                                  <button
                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                    className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 text-xs font-mono font-medium text-stone-900 tabular-nums">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                    disabled={isMaxStockReached}
                                    className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    aria-label="Increase quantity"
                                    title={isMaxStockReached ? `Maximum available stock: ${stockQty} pieces` : 'Increase quantity'}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                {isMaxStockReached && (
                                  <span className="text-[10px] text-amber-700 font-medium">
                                    Max stock ({stockQty} pcs)
                                  </span>
                                )}
                              </div>

                              <span className="text-xs font-semibold text-stone-900 font-mono tabular-nums">
                                {lineTotal.toLocaleString()} DZD
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Step: Checkout Form */}
            {checkoutStep === 'checkout' && (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="text-xs text-stone-600 pb-2 border-b border-stone-200">
                  Please provide your delivery details. Cash on Delivery (COD) is available nationwide.
                </div>

                {submissionError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-rose-900">Order Could Not Be Completed</p>
                      <p>{submissionError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="e.g. Amina Benali"
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800 disabled:bg-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number (for Courier Confirmation) *
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={isSubmitting}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="0784986932 or 0550..."
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800 disabled:bg-stone-100"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Wilaya / Region *
                    </label>
                    {isPoleUniversitaire && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                        LIVRAISON GRATUITE (0 DZD)
                      </span>
                    )}
                  </div>
                  <select
                    disabled={isSubmitting}
                    value={customer.wilaya}
                    onChange={(e) => setCustomer({ ...customer, wilaya: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900 disabled:bg-stone-100"
                  >
                    <option value="Pôle Universitaire Koléa">
                      🎓 Pôle Universitaire Koléa (Campus) — Livraison Gratuite (0 DZD)
                    </option>
                    <option value="Tipaza (Koléa Centre & Environs)">
                      42 - Tipaza (Koléa Centre & Environs)
                    </option>
                    <option value="Alger">16 - Alger</option>
                    <option value="Blida">09 - Blida</option>
                    <option value="Boumerdès">35 - Boumerdès</option>
                    <option value="Oran">31 - Oran</option>
                    <option value="Constantine">25 - Constantine</option>
                    <option value="Other Wilayas">Toutes les autres 58 Wilayas (500 DZD)</option>
                  </select>

                  {isPoleUniversitaire && (
                    <div className="mt-1.5 p-2 bg-emerald-50/80 border border-emerald-200/80 rounded-md text-[11px] text-emerald-800 flex items-start gap-1.5 leading-snug">
                      <span className="font-bold text-emerald-700">✓</span>
                      <span>
                        <strong>Offre Spéciale Campus :</strong> Frais de livraison 100% gratuits au Pôle Universitaire de Koléa (remise en main propre sur le campus / écoles / résidences).
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Delivery Address & Landmarks *
                  </label>
                  <textarea
                    required
                    rows={2}
                    disabled={isSubmitting}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Street, building, quartier..."
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800 resize-none disabled:bg-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    placeholder="Preferred delivery time, gift packaging..."
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800 disabled:bg-stone-100"
                  />
                </div>
              </form>
            )}

            {/* Step: Success Confirmation (Only shown after Firestore confirms persistence) */}
            {checkoutStep === 'success' && confirmedOrder && (
              <div className="py-6 text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl font-semibold text-stone-900">
                    Order Confirmed & Saved!
                  </h3>
                  <p className="text-xs text-stone-600 max-w-xs mx-auto">
                    Thank you, <span className="font-semibold text-stone-800">{confirmedOrder.customerName}</span>. Your order has been securely stored in our atelier database. We will call you shortly at <span className="font-mono font-medium text-stone-800">{confirmedOrder.customerPhone}</span> to finalize parcel dispatch.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-stone-200 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Order Reference</span>
                    <span className="font-mono text-stone-900 font-semibold">{confirmedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Initial Status</span>
                    <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {confirmedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Payment Method</span>
                    <span className="text-stone-900 font-medium">Cash on Delivery (COD)</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Destination</span>
                    <span className="text-stone-900 font-medium">{confirmedOrder.wilaya}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Delivery Fee</span>
                    <span className="font-mono text-emerald-800 font-semibold tabular-nums">
                      {confirmedOrder.shipping === 0 ? 'FREE (0 DZD)' : `${confirmedOrder.shipping.toLocaleString()} DZD`}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-700 block">Ordered Items ({confirmedOrder.items.length}):</span>
                    {confirmedOrder.items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-[11px] text-stone-600">
                        <span className="truncate pr-2">
                          {item.quantity}× {item.title}
                        </span>
                        <span className="font-mono tabular-nums shrink-0">
                          {item.lineTotal.toLocaleString()} DZD
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-stone-500 pt-2 border-t border-stone-100">
                    <span className="font-semibold text-stone-800">Total Payable</span>
                    <span className="font-mono font-bold text-stone-900 text-sm tabular-nums">
                      {confirmedOrder.total.toLocaleString()} DZD
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Recorded on {new Date(confirmedOrder.createdAt).toLocaleDateString()} at {new Date(confirmedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full py-3 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Footer & Calculations (Only when in Cart or Checkout) */}
          {cartSummary.items.length > 0 && checkoutStep !== 'success' && (
            <div className="p-6 border-t border-stone-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-900 tabular-nums">
                    {cartSummary.subtotal.toLocaleString()} DZD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({isPoleUniversitaire ? 'Pôle Univ. Koléa' : 'Nationwide'})</span>
                  <span className="font-mono text-stone-900 tabular-nums">
                    {effectiveShipping === 0 ? (
                      <span className="text-emerald-800 font-semibold">FREE (0 DZD)</span>
                    ) : (
                      `${effectiveShipping.toLocaleString()} DZD`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-semibold text-stone-900">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums">
                    {effectiveTotal.toLocaleString()} DZD
                  </span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setCheckoutStep('checkout')}
                    className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCheckoutStep('cart')}
                    className="px-3 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 disabled:opacity-50 border border-stone-300 rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Order to Database...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Order (COD)</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
