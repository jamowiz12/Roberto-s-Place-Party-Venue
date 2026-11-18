const images = [
 ['Garden Setup','Venue','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80'],
 ['Celebration Table','Catering','https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80'],
 ['Main Hall','Venue','https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80'],
 ['Reception','Events','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80'],
 ['Wedding Stage','Events','https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80'],
 ['Dining Experience','Catering','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80'],
] as const

export default function Gallery(){return <section className="content-section"><p className="eyebrow">OUR GALLERY</p><h1 className="page-title">Moments beautifully hosted</h1><div className="pill-row">{['All','Venue','Catering','Events'].map((item,index)=><button className={`pill ${index===0?'active':''}`} key={item}>{item}</button>)}</div><div className="gallery-grid">{images.map(([name,,src])=><img key={name} src={src} alt={name}/>)}</div></section>}
