'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Register(){
 const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState('')
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');const supabase=createClient();const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)setError(error.message);else setMessage('Account created. Check your email if confirmation is required.')}
 return <section className="content-section"><div style={{maxWidth:460,margin:'auto'}} className="form-card"><p className="eyebrow">CREATE YOUR ACCOUNT</p><h1 className="page-title">Join Roberto&apos;s Place</h1><form onSubmit={submit}><div className="field"><label>Full name</label><input required value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label>Email address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/></div>{error?<p style={{color:'#9B3E32'}}>{error}</p>:null}{message?<p style={{color:'#466657'}}>{message}</p>:null}<button className="primary" style={{width:'100%',marginTop:18}}>Create account</button></form></div></section>
}
