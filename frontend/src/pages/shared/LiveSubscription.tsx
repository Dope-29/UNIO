import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import StaffLayout from '../../components/Layout/StaffLayout';
import PortalLayout from '../../components/Layout/PortalLayout';
import { useApiItem } from '../../hooks/useApi';
import { post, messageFrom } from '../../lib/api';

type Subscription = { id:string; number:string; status:string; pausedAt:string|null; startDate:string; expiryDate:string; nextBillingDate:string|null; paymentTerms:string; plan:{name:string;billingPeriod:string;allowPause:boolean;allowRenew:boolean;allowEarlyClose:boolean}; customer:{name:string}; lines:{id:string;quantity:number;unitPrice:string;product:{name:string}}[] };
export default function LiveSubscription({role}:{role:'admin'|'staff'|'portal'}) {
  const {id}=useParams(); const navigate=useNavigate(); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  const root=role==='portal'?'/portal/subscriptions':'/subscriptions';
  const {data:s,loading,error,reload}=useApiItem<Subscription>(`${root}/${encodeURIComponent(id??'')}`,!!id);
  const Layout=role==='admin'?AdminLayout:role==='staff'?StaffLayout:PortalLayout;
  const action=async(name:string)=>{if(!s)return;setBusy(true);setMessage('');try{await post(`${root}/${encodeURIComponent(s.id)}/${name}`);await reload();setMessage(name==='send-quote'?'Quotation queued for delivery.':'Subscription updated.');}catch(e){setMessage(messageFrom(e));}finally{setBusy(false);}};
  const button=(label:string,name:string)=><button className="btn btn-secondary" disabled={busy} onClick={()=>void action(name)}>{label}</button>;
  return <Layout title="Subscription"><button className="btn btn-secondary" onClick={()=>navigate(`/user/${role}/subscriptions`)}>Back to subscriptions</button>
    {loading&&<p>Loading subscription…</p>}{error&&<p className="form-error">{error}</p>}{message&&<p role="status">{message}</p>}
    {s&&<div className="card" style={{padding:24,marginTop:20}}><h1>{s.number}</h1><p>{s.customer?.name} · {s.plan.name} · {s.pausedAt?'PAUSED':s.status}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {role!=='portal'&&s.status==='DRAFT'&&button('Send quotation','send-quote')}
        {role!=='portal'&&s.status==='QUOTATION'&&button('Confirm','confirm')}
        {role!=='portal'&&s.status==='CONFIRMED'&&button('Activate','activate')}
        {s.status==='ACTIVE'&&s.plan.allowPause&&button(s.pausedAt?'Resume':'Pause',s.pausedAt?'resume':'pause')}
        {s.status==='ACTIVE'&&s.plan.allowRenew&&button('Renew','renew')}
        {s.status==='ACTIVE'&&s.plan.allowEarlyClose&&button('Close','close')}
        {role!=='portal'&&s.status==='ACTIVE'&&!s.pausedAt&&button('Generate invoice','invoice-now')}
      </div>
      <p>Period: {s.startDate.slice(0,10)} to {s.expiryDate.slice(0,10)} · {s.plan.billingPeriod} · {s.paymentTerms}</p><p>Next billing: {s.nextBillingDate?.slice(0,10)??'—'}</p>
      <table className="table" style={{width:'100%'}}><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Subtotal</th></tr></thead><tbody>{s.lines.map(l=><tr key={l.id}><td>{l.product.name}</td><td>{l.quantity}</td><td>{l.unitPrice}</td><td>{(l.quantity*Number(l.unitPrice)).toFixed(2)}</td></tr>)}</tbody></table>
    </div>}
  </Layout>;
}
