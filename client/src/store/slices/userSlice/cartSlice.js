import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [], 
  total: 0,
  status: 'idle',
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { productId, variantId, quantity = 1, price, name, size, unit, image } = action.payload
      const existingItem = state.items.find(
        (item) => item.productId === productId && (!variantId || item.variantId === variantId)
      )
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({ productId, variantId, quantity, price, name, size, unit, image })
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    updateCartItem(state, action) {
      const { productId, variantId, quantity } = action.payload
      const item = state.items.find(
        (item) => item.productId === productId && (!variantId || item.variantId === variantId)
      )
      if (item && quantity > 0) {
        item.quantity = quantity
        state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    },
    removeFromCart(state, action) {
      const { productId, variantId } = action.payload
      state.items = state.items.filter(
        (item) => !(item.productId === productId && (!variantId || item.variantId === variantId))
      )
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    clearCart(state) {
      state.items = []
      state.total = 0
    },
    setCart(state, action) {
      state.items = action.payload.items || []
      state.total = action.payload.total || 0
    },
    setCartStatus(state, action) {
      state.status = action.payload
    },
    setCartError(state, action) {
      state.error = action.payload
    },
  },
})

export const {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setCart,
  setCartStatus,
  setCartError,
} = cartSlice.actions

export default cartSlice.reducer