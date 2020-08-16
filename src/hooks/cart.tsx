import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartItems = await AsyncStorage.getItem('@GoMarketPlace:cartItems');
      if (cartItems) {
        setProducts(JSON.parse(cartItems));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const cartProducts = products;
      const cartItem = cartProducts.find(
        itemInCart => itemInCart.id === product.id,
      );
      if (cartItem) {
        const indexItem = cartProducts.indexOf(cartItem);
        cartProducts[indexItem] = {
          ...cartProducts[indexItem],
          quantity: cartProducts[indexItem].quantity + 1,
        };
      } else {
        cartProducts.push({ ...product, quantity: 1 });
      }
      setProducts([...cartProducts]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cartItems',
        JSON.stringify(cartProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const cartProducts = products;
      const product = cartProducts.find(itemInCart => itemInCart.id === id);
      if (!product) {
        throw new Error('Product Id not found');
      }
      const indexItem = cartProducts.indexOf(product);
      cartProducts[indexItem] = {
        ...cartProducts[indexItem],
        quantity: cartProducts[indexItem].quantity + 1,
      };
      setProducts([...cartProducts]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cartItems',
        JSON.stringify(cartProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const cartProducts = products;
      const product = cartProducts.find(itemInCart => itemInCart.id === id);
      if (!product) {
        throw new Error('Product Id not found');
      }
      const indexItem = cartProducts.indexOf(product);

      if (cartProducts[indexItem].quantity > 1) {
        cartProducts[indexItem] = {
          ...cartProducts[indexItem],
          quantity: cartProducts[indexItem].quantity - 1,
        };
      } else {
        cartProducts.splice(indexItem, 1);
      }
      setProducts([...cartProducts]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:cartItems',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
