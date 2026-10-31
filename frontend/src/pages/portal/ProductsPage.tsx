import { useState } from 'react';
import PortalLayout from '../../components/Layout/PortalLayout';
import { useApiPage } from '../../hooks/useApi';

type Product = {id:string;name:string;type:string;salesPrice:string;variants:{id:string;attribute:string;value:string;extraPrice:string}[]};
export default function ProductsPage(){
 const [page,setPage]=useState(1);
 const {data,loading,error}=useApiPage<Product>(`/portal/products?page=${page}&take=25`);
 return <PortalLayout title="Products"><h1>Products</h1><p>Browse available products and variants. Contact our team to request a quotation; staff will prepare the subscription for you.</p>
 {loading&&<p>Loading products…</p>}{error&&<p className="form-error">{error}</p>}
 {!loading&&!error&&data.length===0&&<p>No products on this page.</p>}
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>{data.map(p=><div className="card" style={{padding:20}} key={p.id}><h3>{p.name}</h3><p>{p.type}</p><p>Price: {p.salesPrice}</p>{p.variants.length>0&&<ul>{p.variants.map(v=><li key={v.id}>{v.attribute}: {v.value} (+{v.extraPrice})</li>)}</ul>}</div>)}</div>
 <div style={{display:'flex',gap:8,marginTop:16}}><button className="btn btn-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page}</span><button className="btn btn-secondary" disabled={data.length<25} onClick={()=>setPage(p=>p+1)}>Next</button></div>
 </PortalLayout>;
}
