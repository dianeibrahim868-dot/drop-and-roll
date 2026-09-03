export type Product = {
  id:string; name:string; description:string; price_cfa:number; stock:number;
  image_url:string|null; active:boolean;
};
export type CartItem = { product: Product; quantity:number };
