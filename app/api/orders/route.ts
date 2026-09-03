import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {Resend} from 'resend';

const admin=()=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
const money=(n:number)=>new Intl.NumberFormat('fr-FR').format(n)+' CFA';

export async function POST(req:Request){
 try{
  const body=await req.json(); const c=body.customer; const items=body.items;
  if(!c?.name||!c?.phone||!c?.zone||!c?.address||!Array.isArray(items)||!items.length) return NextResponse.json({error:'Données invalides'},{status:400});
  const sb=admin(); const ids=items.map((x:any)=>x.product_id);
  const {data:products,error}=await sb.from('products').select('id,name,price_cfa,stock,active').in('id',ids);
  if(error||!products?.length) return NextResponse.json({error:'Produits introuvables'},{status:400});
  let total=0; const lines:any[]=[];
  for(const item of items){const p=products.find((x:any)=>x.id===item.product_id);const qty=Math.trunc(Number(item.quantity));if(!p||!p.active||!Number.isFinite(qty)||qty<1||qty!==Math.trunc(qty)||qty>p.stock) return NextResponse.json({error:'Stock insuffisant'}, {status:409});total+=p.price_cfa*qty;lines.push({product_id:p.id,product_name:p.name,unit_price_cfa:p.price_cfa,quantity:qty});}
  const {data:order,error:oe}=await sb.from('orders').insert({customer_name:c.name,customer_phone:c.phone,delivery_zone:c.zone,delivery_address:c.address,note:c.note||'',total_cfa:total}).select().single();
  if(oe) throw oe;
  await sb.from('order_items').insert(lines.map(x=>({...x,order_id:order.id})));
  for(const line of lines){
    // Atomic guard: only update if DB stock is still >= quantity (prevents race conditions)
    const {data: updated, error: stockError} = await sb
      .from('products')
      .update({stock: (products.find((x:any)=>x.id===line.product_id)!.stock - line.quantity)})
      .eq('id', line.product_id)
      .gte('stock', line.quantity)
      .select('id');
    if (stockError) throw stockError;
    if (!updated || updated.length === 0) {
      return NextResponse.json({error:'Stock insuffisant (commande simultanée détectée)'},{status:409});
    }
  }
  if(process.env.RESEND_API_KEY&&process.env.OWNER_EMAIL){
   const resend=new Resend(process.env.RESEND_API_KEY);
   await resend.emails.send({from:'Drop & Roll <onboarding@resend.dev>',to:[process.env.OWNER_EMAIL],subject:`Nouvelle commande ${order.id.slice(0,8)}`,html:`<h2>Nouvelle commande Drop & Roll</h2><p><b>Client :</b> ${c.name}</p><p><b>Téléphone :</b> ${c.phone}</p><p><b>Zone :</b> ${c.zone}</p><p><b>Adresse :</b> ${c.address}</p><p><b>Total :</b> ${money(total)}</p><p><b>Paiement :</b> à la livraison</p>`});
  }
  return NextResponse.json({ok:true,order_id:order.id});
 }catch(e){console.error(e);return NextResponse.json({error:'Erreur serveur'},{status:500})}
}