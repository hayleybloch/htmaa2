import { WindowProps } from "@/components/WindowManagement/WindowCompositor";
import Image from 'next/image';
import styles from './SkillsView.module.css';
import getPublicPath from '@/lib/getPublicPath';
import { useTranslation } from "react-i18next";

function SkillEntry(props: { skill: string, iconSrc?: string, iconAlt?: string }) {
  const { skill, iconSrc, iconAlt } = props;
  
  return (
    <div className={styles['skill-entry']}>
      {iconSrc && (
        <Image
          quality={100}
          draggable={false}
          width={24}
          height={24}
          src={iconSrc}
          alt={iconAlt ?? skill}
        />
      )}
      <span>{skill}</span>
    </div>
  );
}

export default function SkillsView(props: WindowProps) {
  const { t } = useTranslation('common');
  
  return (
    <div className="content-outer">
      <div className="content">
        <div className='content-inner'>
          <div className={styles['skills-content']}>

          <h1>Programming</h1>
<ul>
  <li><SkillEntry skill="Python" iconSrc={getPublicPath('/icons/skills/python.svg?v=2')} iconAlt="Python" /></li>
  <li><SkillEntry skill="Arduino (C++)" iconSrc={getPublicPath('/icons/skills/arduino.svg')} iconAlt="Arduino" /></li>
  <li><SkillEntry skill="JavaScript / HTML / CSS" iconSrc={getPublicPath('/icons/skills/javascript.svg')} iconAlt="JavaScript" /></li>
</ul>

<h1>Electronics & Prototyping</h1>
<ul>
  <li><SkillEntry skill="PCB Design (KiCad)" iconSrc={getPublicPath('/icons/skills/kicad.svg')} iconAlt="KiCad" /></li>
  <li><SkillEntry skill="Microcontrollers (Arduino, nRF52, Raspberry Pi)" iconSrc={getPublicPath('/icons/skills/cpu.svg')} iconAlt="Microcontrollers" /></li>
  <li><SkillEntry skill="Soldering & Circuit Prototyping" iconSrc={getPublicPath('/icons/skills/soldering.svg?v=2')} iconAlt="Soldering" /></li>
</ul>

<h1>Digital Fabrication</h1>
<ul>
  <li><SkillEntry skill="3D Modeling (Fusion 360, Blender)" iconSrc={getPublicPath('/icons/skills/blender.svg')} iconAlt="Blender" /></li>
  <li><SkillEntry skill="3D Printing (SLA & FDM)" iconSrc={getPublicPath('/icons/skills/printer.svg')} iconAlt="3D Printing" /></li>
  <li><SkillEntry skill="Laser Cutting" iconSrc={getPublicPath('/icons/skills/laser.svg')} iconAlt="Laser Cutting" /></li>
</ul>

<h1>Creative</h1>
<ul>
  <li><SkillEntry skill="Ceramics & Sculpture" iconSrc={getPublicPath('/icons/skills/ceramics.svg')} iconAlt="Ceramics" /></li>
  <li><SkillEntry skill="Fashion & Performance" iconSrc={getPublicPath('/icons/skills/fashion.svg')} iconAlt="Fashion" /></li>
  <li><SkillEntry skill="Visual Design (Figma, Canva)" iconSrc={getPublicPath('/icons/skills/figma.svg')} iconAlt="Figma" /></li>
</ul>

<h1>Tools</h1>
<ul>
  <li><SkillEntry skill="Git / GitHub" iconSrc={getPublicPath('/icons/skills/git.svg?v=2')} iconAlt="Git" /></li>
  <li><SkillEntry skill="VS Code" iconSrc={getPublicPath('/icons/skills/vsc.svg?v=2')} iconAlt="VS Code" /></li>
</ul>


          </div>
        </div>
      </div>
    </div>
  );
}
