const items = [
  ['Beef Caldereta','Mains','Tender beef in a rich tomato and pepper sauce','₱680'],
  ['Chicken Inasal','Mains','Char-grilled chicken with citrus and annatto aromatics','₱540'],
  ['Pancit Canton','Noodles','Classic noodles with vegetables and savory toppings','₱520'],
  ['Garden Vegetables','Sides','Seasonal vegetables with a light garlic finish','₱420'],
  ['Fruit Platter','Desserts','A fresh selection of colorful seasonal fruit','₱460'],
] as const

export default function Menu() {
  return <section className="content-section"><p className="eyebrow">THE CELEBRATION TABLE</p><h1 className="page-title">Food made for sharing</h1><div className="pill-row">{['All dishes','Mains','Noodles','Sides','Desserts'].map((item,index)=><button className={`pill ${index===0?'active':''}`} key={item}>{item}</button>)}</div><div className="cards-grid">{items.map(([name,category,copy,price])=><article className="info-card" key={name}><p className="eyebrow">{category}</p><h3>{name}</h3><p style={{color:'#887E74',lineHeight:1.7}}>{copy}</p><strong>{price}</strong></article>)}</div></section>
}
