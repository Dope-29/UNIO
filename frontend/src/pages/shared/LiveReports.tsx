import { useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import StaffLayout from '../../components/Layout/StaffLayout';
import { useApiItem, useApiPage } from '../../hooks/useApi';

type Summary={activeSubscriptions:number;revenue:string;outstanding:string;overdueCount:number};
type Row=Record<string,unknown>;
type Kind='subscriptions'|'invoices'|'payments';
export default function LiveReports({role, dashboard=false}:{role:'admin'|'staff';dashboard?:boolean}){
 const Layout=role==='admin'?AdminLayout:StaffLayout;const [kind,setKind]=useState<Kind>('invoices');const [page,setPage]=useState(1);const [from,setFrom]=useState('');const [to,setTo]=useState('');
 const filter=new URLSearchParams();if(from)filter.set('from',new Date(`${from}T00:00:00.000Z`).toISOString());if(to)filter.set('to',new Date(`${to}T23:59:59.999Z`).toISOString());
 const q=filter.toString();const summary=useApiItem<Summary>(`/reports/summary?${q}`);const rows=useApiPage<Row>(`/reports/${kind}?${q}${q?'&':''}page=${page}&take=25`);
 const columns:Record<Kind,string[]>={subscriptions:['number','status','startDate','expiryDate','paymentTerms'],invoices:['number','customerName','status','issueDate','dueDate','total','amountPaid','currency'],payments:['invoiceId','method','amount','paidAt','note']};
 const url=`${import.meta.env.VITE_API_URL??''}/api/reports/${kind}?${q}${q?'&':''}page=${page}&take=25&format=csv`;
 return <Layout title={dashboard?'Dashboard':'Reports'}><h1>{dashboard?'Dashboard':'Financial reports'}</h1><div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'16px 0'}}><label>From <input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1);}} /></label><label>To <input type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1);}} /></label></div>
 {summary.loading&&<p>Loading summary…</p>}{summary.error&&<p className="form-error">{summary.error}</p>}{summary.data&&<div className="stats-grid">{Object.entries({ 'Active subscriptions':summary.data.activeSubscriptions,'Revenue collected':summary.data.revenue,'Outstanding':summary.data.outstanding,'Overdue invoices':summary.data.overdueCount }).map(([label,value])=><div className="card" style={{padding:18}} key={label}><p>{label}</p><strong>{value}</strong></div>)}</div>}
 <div style={{display:'flex',gap:8,margin:'20px 0'}}>{(['subscriptions','invoices','payments'] as const).map(k=><button className={`btn ${kind===k?'btn-primary':'btn-secondary'}`} key={k} onClick={()=>{setKind(k);setPage(1);}}>{k}</button>)}<a className="btn btn-secondary" href={url}>Export page CSV</a></div>
 {rows.loading&&<p>Loading report…</p>}{rows.error&&<p className="form-error">{rows.error}</p>}
 <div className="card" style={{overflowX:'auto'}}><table className="table" style={{width:'100%'}}><thead><tr>{columns[kind].map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.data.map((r,index)=><tr key={String(r.id??index)}>{columns[kind].map(c=><td key={c}>{String(r[c]??'—')}</td>)}</tr>)}</tbody></table>{!rows.loading&&!rows.error&&!rows.data.length&&<p>No records found.</p>}</div>
 <div style={{display:'flex',gap:8,marginTop:16}}><button className="btn btn-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page}</span><button className="btn btn-secondary" disabled={rows.data.length<25} onClick={()=>setPage(p=>p+1)}>Next</button></div></Layout>;
}
