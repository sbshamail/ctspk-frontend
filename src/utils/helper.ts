// if you start with [1, 2, 3, 4, 5], the shuffled array might be [3, 2, 5, 1, 4] or [5, 1, 4, 3, 2], depending on the random indices generated during the shuffle process.
export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// // testOne  == Test One
export const capitalizeCamelSpace = (name: string) => {
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  return capitalized.replace(/([A-Z])/g, " $1").trim();
};

// Format order ID as GTISB + YEAR + DATE + MONTH + ORDERID (8 digits with leading zeros)
export const formatOrderId = (orderId: number | string | undefined | null, createdAt?: string | Date): string => {
  // Convert orderId to a valid number, handling all edge cases
  let id = 0;
  if (orderId !== undefined && orderId !== null) {
    const parsed = typeof orderId === 'string' ? parseInt(orderId, 10) : Number(orderId);
    if (!isNaN(parsed) && isFinite(parsed)) {
      id = Math.floor(Math.abs(parsed));
    }
  }

  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Pad order ID to 8 digits with leading zeros (e.g., 1 -> 00000001)
  const paddedOrderId = String(id).padStart(8, '0');

  return `GTISB${year}${day}${month}${paddedOrderId}`;
};

// Get order status label from status code
export const getOrderStatusLabel = (status: string | number): string => {
  const statusMap: { [key: string]: string } = {
    '1': 'Pending',
    'pending': 'Pending',
    '2': 'Processing',
    'processing': 'Processing',
    '3': 'Packed',
    'packed': 'Packed',
    '4': 'At Distribution Center',
    'at-distribution-center': 'At Distribution Center',
    'at_distribution_center': 'At Distribution Center',
    '5': 'At Local Facility',
    'at-local-facility': 'At Local Facility',
    'at_local_facility': 'At Local Facility',
    '6': 'Out for Delivery',
    'out-for-delivery': 'Out for Delivery',
    'out_for_delivery': 'Out for Delivery',
    '7': 'Delivered',
    'delivered': 'Delivered',
    '8': 'Completed',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
  };

  const key = String(status).toLowerCase();
  return statusMap[key] || String(status).replace(/-|_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const currencyFormatter = (
  value: number | string | undefined,
  currency: "PKR" | "SAR" | "EUR" | "JPY" | "USD" | "INR" | null = "PKR",
  format: "en-PK" | "en-US" | "de-DE" | "ja-JP" | "en-IN" = "en-PK"
): string => {
  // @ts-ignore
  if(!value) { return ; }
  if (typeof value == 'string'){value=Number(value);}

  // Round to whole number - no decimal places
  const wholeValue = Math.round(value);

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  if (currency) {
    options.style = "currency";
    options.currency = currency;
  }

  const numberFormatter = new Intl.NumberFormat(format, options);

  // We format the absolute value of the provided number to handle both positive and negative values.
  let formattedValue = numberFormatter.format(Math.abs(wholeValue));

  // If the value is negative, adjust the formatting
  if (wholeValue < 0) {
    if (currency) {
      formattedValue = formattedValue.replace(/^(\D+)/, "$1-");
    } else {
      formattedValue = `-${formattedValue}`;
    }
  }

  // Replace currency symbols with Rs.
  formattedValue = formattedValue
    .replace(/PKR\s?/gi, "Rs. ")
    .replace(/₨\s?/g, "Rs. ")
    .replace(/\$\s?/g, "Rs. ")
    .replace(/Rs\s/g, "Rs. ") // Replace Rs with Rs.
    .replace(/Rs\.?\s*Rs\./g, "Rs."); // Remove duplicate Rs.

  return formattedValue;
};

export const titleSubstring = (
  title: string,
  length: number = 35,
  max: number = 25
) => {
  if (title && title.length > length) {
    return title.substring(0, max) + "...";
  }
  return title;
};

export function seoTitle(title: string): string {
  return title
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim() // Trim whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}
