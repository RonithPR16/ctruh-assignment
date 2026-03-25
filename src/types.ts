export type ProductId = string | number

export type Product = {
  id: ProductId
  name: string
  price: number
  currency?: string
  image: string
  type: string
  gender: string
  color: string
  quantity: number
}

export type CartItem = {
  id: ProductId
  name: string
  price: number
  currency?: string
  image: string
  type: string
  gender: string
  color: string
  stock: number
  cartQty: number
}
