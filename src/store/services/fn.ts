export type QueryParams = {
  page?: number; // current page number (1-based)
  limit?: number; // number of items to return per page
  searchTerm?: string; // keyword search
  columnFilters?: [string, string | number | boolean][]; // e.g. [["name","car"],["description","product"]]
  numberRange?: [string, number, number]; // e.g. ["amount", 0, 1000]
  dateRange?: [string, string, string]; // e.g. ["created_at","01-01-2025","01-12-2025"]
  sort?: [string, "asc" | "desc"];
};

export const toQueryString = (params: Record<string, any> = {}) => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      let v = value;

      // If array or object, stringify
      if (Array.isArray(value) || typeof value === "object") {
        // Custom replacer: convert JS booleans to Python booleans
        v = JSON.stringify(value, (_k, val) => {
          if (val === true) return "True";
          if (val === false) return "False";
          return val;
        });
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(v)}`;
    })
    .join("&");

  return query;
};
