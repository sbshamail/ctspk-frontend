// Redux Query Added by Hamail, no need this wishlistService.ts, path is "store->services->wishlistAPi"

// // lib/wishlistService.ts
// import { getSession } from "@/action/auth";
// import { useEffect, useState } from "react";

// export interface WishlistItem {
//   id: number;
//   product_id: number;
//   variation_option_id: number | null;
//   product?: any;
// }

// // Global state
// let globalWishlist: WishlistItem[] = [];
// let globalListeners: Array<(wishlist: WishlistItem[]) => void> = [];

// const notifyListeners = () => {
//   globalListeners.forEach((listener) => listener([...globalWishlist]));
// };

// export const useWishlist = () => {
//   const [wishlist, setWishlist] = useState<WishlistItem[]>(globalWishlist);

//   useEffect(() => {
//     // Add listener when component mounts
//     globalListeners.push(setWishlist);

//     // Remove listener when component unmounts
//     return () => {
//       globalListeners = globalListeners.filter(
//         (listener) => listener !== setWishlist
//       );
//     };
//   }, []);

//   const addToWishlist = async (wishlistData: {
//     product_id: number;
//     variation_option_id: number | null;
//   }) => {
//     try {
//       const accessToken = getSession("access_token");

//       if (!accessToken) {
//         throw new Error("No access token found");
//       }

//       const response = await fetch("https://api.ctspk.com/wishlist/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify(wishlistData),
//         credentials: "include",
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to add to wishlist");
//       }

//       const newItem = await response.json();

//       // Update global state
//       globalWishlist = [...globalWishlist, newItem.data];
//       notifyListeners();
//     } catch (error) {
//       console.error("Error adding to wishlist:", error);
//       throw error;
//     }
//   };

//   const removeFromWishlist = async (
//     productId: number,
//     variationOptionId: number | null
//   ) => {
//     try {
//       const accessToken = getSession("access_token");

//       if (!accessToken) {
//         throw new Error("No access token found");
//       }

//       const response = await fetch("https://api.ctspk.com/wishlist/remove", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           product_id: productId,
//           variation_option_id: variationOptionId,
//         }),
//         credentials: "include",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to remove from wishlist");
//       }

//       // Update global state
//       globalWishlist = globalWishlist.filter(
//         (item) =>
//           !(
//             item.product_id === productId &&
//             item.variation_option_id === variationOptionId
//           )
//       );
//       notifyListeners();
//     } catch (error) {
//       console.error("Error removing from wishlist:", error);
//       throw error;
//     }
//   };

//   const fetchWishlist = async () => {
//     try {
//       const accessToken = getSession("access_token");

//       if (!accessToken) {
//         console.log("No access token found for fetching wishlist");
//         return;
//       }

//       const response = await fetch(
//         "https://api.ctspk.com/wishlist/my-wishlist?page=1&skip=0&limit=100",
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//           credentials: "include",
//         }
//       );

//       if (response.ok) {
//         const wishlistData = await response.json();
//         globalWishlist = wishlistData.data || [];
//         notifyListeners();
//       } else {
//         console.error("Failed to fetch wishlist:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching wishlist:", error);
//     }
//   };

//   const clearWishlist = () => {
//     globalWishlist = [];
//     notifyListeners();
//   };

//   return {
//     wishlist,
//     addToWishlist,
//     removeFromWishlist,
//     fetchWishlist,
//     clearWishlist,
//   };
// };
