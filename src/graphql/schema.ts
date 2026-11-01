export const typeDefs = `#graphql
  type Product {
    id: ID!
    title: String!
    subtitle: String!
    price: Float!
    currency: String!
    category: String!
    subCategory: String
    volume: String!
    image: String!
    isFeatured: Boolean!
    inStock: Boolean!
    rating: Float!
    reviewsCount: Int!
    description: String!
    ingredients: [String!]!
    benefits: [String!]!
  }

  type CartItem {
    product: Product!
    quantity: Int!
    lineTotal: Float!
  }

  type CartSummary {
    items: [CartItem!]!
    totalItems: Int!
    subtotal: Float!
    shipping: Float!
    tax: Float!
    total: Float!
  }

  type StoreInfo {
    name: String!
    phone: String!
    phoneFormatted: String!
    instagram: String!
    instagramHandle: String!
    addressText: String!
    googleMapsUrl: String!
    city: String!
    country: String!
    openingHours: String!
  }

  type ContactSubmission {
    id: ID!
    name: String!
    email: String!
    message: String!
    submittedAt: String!
    status: String!
  }

  input ContactInput {
    name: String!
    email: String!
    message: String!
  }

  type Query {
    products(category: String, search: String, sort: String): [Product!]!
    product(id: ID!): Product
    featuredProducts: [Product!]!
    cartSummary: CartSummary!
    storeInfo: StoreInfo!
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int): CartSummary!
    removeFromCart(productId: ID!): CartSummary!
    updateCartQuantity(productId: ID!, quantity: Int!): CartSummary!
    clearCart: CartSummary!
    submitContact(input: ContactInput!): ContactSubmission!
  }
`;
