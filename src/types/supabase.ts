export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    address: string | null
                    phone: string | null
                    role: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    address?: string | null
                    phone?: string | null
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    address?: string | null
                    phone?: string | null
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    stock: number
                    category_id: string | null
                    is_featured: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    stock?: number
                    category_id?: string | null
                    is_featured?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    stock?: number
                    category_id?: string | null
                    is_featured?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            product_variations: {
                Row: {
                    id: string
                    product_id: string
                    name: string
                    value: string
                    price_adjustment: number
                    stock: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    name: string
                    value: string
                    price_adjustment?: number
                    stock?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    name?: string
                    value?: string
                    price_adjustment?: number
                    stock?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            product_images: {
                Row: {
                    id: string
                    product_id: string
                    url: string
                    is_primary: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    url: string
                    is_primary?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    url?: string
                    is_primary?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            coupons: {
                Row: {
                    id: string
                    code: string
                    description: string | null
                    discount_type: string
                    discount_value: number
                    valid_from: string
                    valid_until: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    description?: string | null
                    discount_type: string
                    discount_value: number
                    valid_from?: string
                    valid_until?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    description?: string | null
                    discount_type?: string
                    discount_value?: number
                    valid_from?: string
                    valid_until?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string | null
                    subtotal: number
                    discount: number
                    tax: number
                    shipping_fee: number
                    total_price: number
                    coupon_id: string | null
                    shipping_address: string | null
                    status: string
                    payment_status: string
                    payment_method: string | null
                    tracking_number: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string | null
                    subtotal?: number
                    discount?: number
                    tax?: number
                    shipping_fee?: number
                    total_price?: number
                    coupon_id?: string | null
                    shipping_address?: string | null
                    status?: string
                    payment_status?: string
                    payment_method?: string | null
                    tracking_number?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    subtotal?: number
                    discount?: number
                    tax?: number
                    shipping_fee?: number
                    total_price?: number
                    coupon_id?: string | null
                    shipping_address?: string | null
                    status?: string
                    payment_status?: string
                    payment_method?: string | null
                    tracking_number?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    product_name: string
                    quantity: number
                    price: number
                    variations: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id?: string | null
                    product_name: string
                    quantity: number
                    price: number
                    variations?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string | null
                    product_name?: string
                    quantity?: number
                    price?: number
                    variations?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            carts: {
                Row: {
                    id: string
                    user_id: string
                    product_id: string
                    quantity: number
                    variations: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_id: string
                    quantity: number
                    variations?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_id?: string
                    quantity?: number
                    variations?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            favorites: {
                Row: {
                    id: string
                    user_id: string
                    product_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_id?: string
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    user_id: string | null
                    product_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    product_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    product_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            payment_transactions: {
                Row: {
                    id: string
                    order_id: string
                    amount: number
                    status: string
                    payment_method: string
                    payment_details: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    amount: number
                    status: string
                    payment_method: string
                    payment_details?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    amount?: number
                    status?: string
                    payment_method?: string
                    payment_details?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            product_summary: {
                Row: {
                    id: string
                    name: string
                    price: number
                    stock: number
                    category: string | null
                    review_count: number | null
                    avg_rating: number | null
                    primary_image: string | null
                }
            }
        }
        Functions: {
            is_coupon_valid: {
                Args: {
                    coupon_code: string
                }
                Returns: boolean
            }
            decrease_product_stock: {
                Args: Record<string, never>
                Returns: unknown
            }
            calculate_order_total: {
                Args: Record<string, never>
                Returns: unknown
            }
        }
    }
} 