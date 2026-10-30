export default function SectionIntro({title,copy,meta}:{title:string;copy:string;meta?:string}) {
 return <div className="section-intro"><div className="intro-title"><h2>{title}</h2>{meta&&<span>{meta}</span>}</div>{copy&&<p>{copy}</p>}</div>;
}
