'use client'
import { useState } from 'react'

export default function Inquiry(){
 const [sent,setSent]=useState(false)
 return <section className="content-section"><div className="form-layout"><div><p className="eyebrow">EVENT INQUIRY</p><h1 className="page-title">Tell us what you&apos;re celebrating.</h1><p style={{color:'#887E74',lineHeight:1.7}}>Share a few details and the Roberto&apos;s Place team can help you plan the right venue, food, and package.</p></div><form className="form-card" onSubmit={(event)=>{event.preventDefault();setSent(true)}}>{sent?<div><h2 style={{fontFamily:'Georgia',color:'#38251D'}}>Inquiry submitted</h2><p style={{color:'#887E74'}}>Thank you. Your event details have been received.</p></div>:<><h2>Your event details</h2><div className="field"><label>Full name</label><input required placeholder="Maria Dela Cruz"/></div><div className="field"><label>Email address</label><input required type="email" placeholder="maria@example.com"/></div><div className="field"><label>Event type</label><input placeholder="Birthday, wedding, corporate event..."/></div><div className="field"><label>Tell us about your event</label><textarea required placeholder="Date, guest count, venue or catering needs"/></div><button className="primary" style={{marginTop:18,width:'100%'}}>Submit inquiry</button></>}</form></div></section>
}
