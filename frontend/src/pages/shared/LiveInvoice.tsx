import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import StaffLayout from '../../components/Layout/StaffLayout';
import PortalLayout from '../../components/Layout/PortalLayout';
import { useApiItem } from '../../hooks/useApi';
import { post, messageFrom } from '../../lib/api';

type Line = { id:string; description:string; quantity:number; unitPrice:string; discountAmount:string; taxRate:string; taxAmount:string; lineTotal:string };
type Invoice = { id:string; number:string; customerName:string; customerAddress:string|null; currency:string; status:string; issueDate:string; dueDate:string; subtotal:string; discountTotal:string; taxTotal:string; total:string; amountPaid:string; lines:Line[] };
export default function LiveInvoice({ role }: { role:'admin'|'staff'|'portal' }) {
  const { id } = useParams(); const navigate = useNavigate();
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  const root=role==='portal'?'/portal/invoices':'/invoices';
  const {data:i,loading,error,reload}=useApiItem<Invoice>(`${root}/${encodeURIComponent(id ?? '')}`,!!id);
  const Layout=role==='admin'?AdminLayout:role==='staff'?StaffLayout:PortalLayout;
  const action=async (name:string)=>{if(!i)return;setBusy(true);setMessage('');try{await post(`${root}/${encodeURIComponent(i.id)}/${name}`);await reload();setMessage(name==='send'?'Invoice sent.':'Invoice updated.');}catch(e){setMessage(messageFrom(e));}finally{setBusy(false);}};
  return <Layout title="Invoice"><button className="btn btn-secondary" onClick={()=>navigate(`/user/${role}/invoices`)}>Back to invoices</button>
    {loading&&<p>Loading invoice…</p>}{error&&<p className="form-error">{error}</p>}{message&&<p role="status">{message}</p>}
    {i&&<div className="card" style={{padding:24,marginTop:20}}><h1>{i.number}</h1><p>{i.customerName} · {i.status}</p><p>{i.customerAddress}</p><p>Issued {i.issueDate.slice(0,10)} · Due {i.dueDate.slice(0,10)}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {role!=='portal'&&i.status==='DRAFT'&&<button className="btn btn-primary" disabled={busy} onClick={()=>void action('confirm')}>Confirm</button>}
        {role!=='portal'&&['DRAFT','CONFIRMED'].includes(i.status)&&Number(i.amountPaid)===0&&<button className="btn btn-danger" disabled={busy} onClick={()=>{if(window.confirm('Cancel this invoice?'))void action('cancel');}}>Cancel invoice</button>}
        {role!=='portal'&&['DRAFT','CONFIRMED'].includes(i.status)&&<button className="btn btn-secondary" disabled={busy} onClick={()=>void action('send')}>Send invoice</button>}
        <a className="btn btn-secondary" href={`${import.meta.env.VITE_API_URL ?? ''}/api${root}/${encodeURIComponent(i.id)}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
        {i.status==='CONFIRMED'&&Number(i.total)>Number(i.amountPaid)&&<button className="btn btn-primary" onClick={()=>navigate(role==='portal'?`/user/portal/payment?invoice=${encodeURIComponent(i.id)}`:`/user/${role}/payments/record?invoice=${encodeURIComponent(i.id)}`)}>{role==='portal'?'Pay online':'Record payment'}</button>}
      </div>
      <table className="table" style={{width:'100%',marginTop:20}}><thead><tr><th>Description</th><th>Quantity</th><th>Unit price</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead><tbody>{i.lines.map(l=><tr key={l.id}><td>{l.description}</td><td>{l.quantity}</td><td>{l.unitPrice}</td><td>{l.discountAmount}</td><td>{l.taxAmount} ({l.taxRate}%)</td><td>{l.lineTotal}</td></tr>)}</tbody></table>
      <p>Subtotal: {i.currency} {i.subtotal} · Discount: {i.discountTotal} · Tax: {i.taxTotal}</p><p>Total: {i.total} · Paid: {i.amountPaid} · Balance: {(Number(i.total)-Number(i.amountPaid)).toFixed(2)}</p>
    </div>}
  </Layout>;
}
