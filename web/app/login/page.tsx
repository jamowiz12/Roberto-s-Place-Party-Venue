'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
 const router=useRouter()
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email,password});setLoading(false);if(error)setError(error.message);else {router.push('/profile');router.refresh()}}
 return <section className="content-section"><div style={{maxWidth:460,margin:'auto'}} className="form-card"><p className="eyebrow">WELCOME BACK</p><h1 className="page-title">Customer login</h1><form onSubmit={submit}><div className="field"><label>Email address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{error?<p style={{color:'#9B3E32',fontSize:13}}>{error}</p>:null}<button className="primary" style={{width:'100%',marginTop:18}} disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><p style={{fontSize:13,marginTop:16}}>New here? <a href="/register" style={{color:'#a77d3d',fontWeight:800}}>Create an account</a></p></div></section>
}
