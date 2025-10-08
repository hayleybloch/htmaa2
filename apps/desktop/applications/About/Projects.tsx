import { SubViewNavigation, SubViewParams } from "./AboutView";
import styles from './AboutView.module.css';
import Image from 'next/image';
import getPublicPath from '@/lib/getPublicPath';


function ProjectImage(props: { src: string, alt: string, label?: string, labelNumber?: number }) {
  const { src, alt, label, labelNumber } = props;
  // Resolve at build-time to ensure exported static files point to the
  // correct GitHub Pages location (e.g. /htmaa2/desktop/images/...)
  const resolvedSrc = getPublicPath(src);

  return (<>
      <div className={styles['project-image-container']}>
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          quality={90}
          style={{ objectFit: 'contain' }}
          sizes="400px, 800px, 1024px"
        />
      </div>
      {label && <span className={styles['project-image-label']}>{label}</span>}
    </>
  );
}

function ProjectPage(props: { title: string, params: SubViewParams, content: JSX.Element }) {
  const params = props.params;

  function openContactApp() {
    params.manager.open('/Applications/Contact.app');
  }

  function englishContent() {
    const contact = (<>
      <p>If you have any questions or comments, please contact me via the <a onClick={() => openContactApp()} href='#contact'>contact application</a> or shoot me an email at <a href="mailto:hayleybl@mit.edu">hayleybl@mit.edu</a></p>
    </>);

    return { contact };
  }


  const content = englishContent();
  const backToProjects = 'Back to projects';

  return (<>
    <div data-subpage className={styles['subpage']}>
      { SubViewNavigation(params) }
      <div data-subpage-content className={styles['subpage-content']}>
        <h1>{props.title}</h1>
        <button onClick={() => params.changeParent('projects')} className={styles['button-link']}>{backToProjects}</button>
        { props.content }

        <h3>Contact</h3>
        { content.contact }

        <button onClick={() => params.changeParent('projects')} className={styles['button-link']}>{backToProjects}</button>
      </div>
    </div>
  </>);
}

export function ProjectWeek1(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>

        <h3>Project Goal</h3>
        <p>
          For Week 1, my goal was to design a humanoid robotic bust that
          represents my vision for the HTMAA final project. This bust will act
          as the foundation for a future robotic system that combines sculpture,
          mechanics, and AI to create an expressive, interactive artwork.
        </p>

        <h3>Why I Wanted to Build This</h3>
        <p>
          I’ve always been drawn to projects that merge technology and
          aesthetics. For me, engineering isn’t only about making things work —
          it’s also a medium for creating art. After discovering a talent in
          sculpture last year, I wanted to combine my engineering and artistic
          skills. The robotic bust is exciting because it allows me to:
        </p>
        <ul>
          <li>
            <strong>Expression through mechanics:</strong> exploring how simple
            motions — a tilt of the head, a shift in gaze, a subtle nod — can
            communicate emotion.
          </li>
          <li>
            <strong>The cyborg as concept:</strong> inspired by Stelarc, H. R.
            Giger, and Hajime Sorayama, I’m interested in the body as a hybrid
            of machine and flesh.
          </li>
          <li>
            <strong>Interactivity and AI:</strong> eventually adding sensors,
            a voice, and reactive behaviors so the bust feels “alive.”
          </li>
          <li>
            <strong>Personal challenge:</strong> this project ties together CAD,
            fabrication, electronics, programming, and sculptural design.
          </li>
        </ul>
        <h3>Artistic Inspiration</h3>
        <p>My design is shaped by three artists who reimagine the human–machine relationship:</p>
        <ul>
          <li>
            <strong>Stelarc</strong> — body extensions and prosthetics inspired
            the idea of the bust as a platform for augmentation and mechanical
            extension.
          </li>
          <li>
            <strong>H. R. Giger</strong> — the biomechanical aesthetic guided
            sculptural details, encouraging a blend of organic surfaces and
            machine-like seams.
          </li>
          <li>
            <strong>Hajime Sorayama</strong> — his polished, futuristic finishes
            influenced my vision for surface treatment: smooth, reflective,
            and slightly uncanny.
          </li>
        </ul>
        {/* Inspiration gallery: images 4-8 are the visual inspirations for the project */}
        <div style={{display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 12}}>
          <div style={{flex: '1 1 18%', minWidth: 120}}>
            <ProjectImage src="/images/Week-1/4w1-min.jpg" alt="Inspiration image 1" label="Inspiration 1" />
          </div>
          <div style={{flex: '1 1 18%', minWidth: 120}}>
            <ProjectImage src="/images/Week-1/5w1-min.jpg" alt="Inspiration image 2" label="Inspiration 2" />
          </div>
          <div style={{flex: '1 1 18%', minWidth: 120}}>
            <ProjectImage src="/images/Week-1/6w1-min.jpg" alt="Inspiration image 3" label="Inspiration 3" />
          </div>
          <div style={{flex: '1 1 18%', minWidth: 120}}>
            <ProjectImage src="/images/Week-1/7w1-min.jpg" alt="Inspiration image 4" label="Inspiration 4" />
          </div>
          <div style={{flex: '1 1 18%', minWidth: 120}}>
            <ProjectImage src="/images/Week-1/8w1-min.jpg" alt="Inspiration image 5" label="Inspiration 5" />
          </div>
        </div>

        <h3>Planned Electronics & Mechanics</h3>
        <ul>
          <li>
            <strong>Servos & actuators:</strong> micro servos for eyes/jaw and
            higher-torque servos for head rotation and neck tilt to achieve
            expressive gestures rather than full humanoid locomotion.
          </li>
          <li>
            <strong>Microcontroller:</strong> Arduino Nano or ESP32 (if wireless
            connectivity is needed) to handle PWM for servos, read sensors, and
            coordinate behaviors.
          </li>
          <li>
            <strong>Sensors:</strong> camera and/or microphone for presence and
            interaction, with ultrasonic or IR sensors as simple presence
            detectors for early prototypes.
          </li>
          <li>
            <strong>Lighting & expression:</strong> LEDs embedded in the eyes or
            under translucent surfaces to indicate attention or emotion.
          </li>
          <li>
            <strong>Voice & AI:</strong> eventual integration of an AI-driven
            voice system (LLMs for dialogue) and a small speaker hidden in the
            base for conversational interactions.
          </li>
          <li>
            <strong>Mechanical integration:</strong> the Week 1 CAD already
            includes cavities and mounting areas for servos, wiring channels,
            and access panels for future electronics work.
          </li>
        </ul>

        <h3>Process</h3>
        <ol>
          <li>
            <strong>Initial concept sketching</strong>
            <p>
              Quick hand sketches in my notebook helped explore proportions,
              gestures, and the balance between organic and mechanical forms.
            </p>
            <ProjectImage src="/images/Week-1/1w1-min.jpg" alt="Initial concept sketch of humanoid bust" label="Initial concept sketch of humanoid bust" labelNumber={1} />
          </li>

          <li>
            <strong>AI-assisted visualization</strong>
            <p>
              I used an AI render to translate my sketch into a 3D visualization
              with lighting and surface details that guided my sculpting.
            </p>
            <p>
              <strong>Prompt used:</strong>
            </p>
            <pre>{`Translate my hand-drawn sketch of a biomechanical bust into a 3D render of a sculptural artwork. The bust should appear as a cracked porcelain or clay shell, revealing a welded mechanical skeleton inside. One side of the face cavity contains a visible camera lens mechanism. The chest is open, displaying polished brass gears, pistons, and wiring interwoven with chrome struts.`}</pre>
              <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-1/2w1-min.jpg" alt="AI sketch-to-render example" label="AI render example (2w1)" labelNumber={2} />
                  <ProjectImage src="/images/Week-1/2w1-min.jpg" alt="AI sketch-to-render example" label="AI render example (2w1)" labelNumber={2} />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-1/3w1-min.jpg" alt="Blender import / initial STL example" label="AI-to-STL / Blender import (3w1)" labelNumber={3} />
                  <ProjectImage src="/images/Week-1/3w1-min.jpg" alt="Blender import / initial STL example" label="AI-to-STL / Blender import (3w1)" labelNumber={3} />
                </div>
              </div>
          </li>

          <li>
            <strong>Rough STL generation (MakerWorld)</strong>
            <p>
              I converted the AI render into a rough STL. The file provided
              an overall silhouette but contained distorted facial features
              that required rebuilding.
            </p>
            <ul>
              <li>Eye was flattened and distorted.</li>
              <li>Nose lacked definition.</li>
              <li>Mouth geometry was stretched and broken.</li>
            </ul>
            <ProjectImage src="/images/Week-1/maker world.png" alt="MakerWorld / Image-to-3D rough output with distorted facial features" label="MakerWorld rough STL" labelNumber={3} />
            <ProjectImage src="/images/Week-1/maker world.png" alt="MakerWorld / Image-to-3D rough output with distorted facial features" label="MakerWorld rough STL" labelNumber={3} />
          </li>

          <li>
            <strong>Sculpting & rebuilding in Blender</strong>
            <p>
              I treated the rough STL like digital clay, using sculpt brushes
              (Grab, Crease, Clay Strips, Smooth) to rebuild features from
              the eyes and nose to the jawline and chest.
            </p>
            <ul>
              <li>Eye: carved proper sockets and reshaped symmetrically.</li>
              <li>Nose: rebuilt bridge and nostrils from scratch.</li>
              <li>Mouth: shaped clean upper/lower planes for realistic lips.</li>
              <li>Jaw & neck: corrected proportions and reinforced weak areas.</li>
            </ul>
            <ProjectImage src="/images/Week-1/vertex clean.png" alt="Vertex clean showing topology fixes in Blender" label="Vertex cleanup / remesh" labelNumber={4} />
            <ProjectImage src="/images/Week-1/vertex clean.png" alt="Vertex clean showing topology fixes in Blender" label="Vertex cleanup / remesh" labelNumber={4} />
          </li>

          <li>
            <strong>Cleanup for fabrication</strong>
            <p>
              Remeshed, smoothed, reduced polygon count, and prepared the
              model for future mechanical integration and possible 3D printing.
            </p>
            <ProjectImage src="/images/Week-1/blender clean up.png" alt="Blender cleanup showing repaired and remeshed geometry" label="Blender cleanup / final cleaned model" labelNumber={5} />
            <ProjectImage src="/images/Week-1/blender clean up.png" alt="Blender cleanup showing repaired and remeshed geometry" label="Blender cleanup / final cleaned model" labelNumber={5} />
            <ProjectImage src="/images/Week-1/1w1-min.jpg" alt="Initial concept sketch of humanoid bust" label="Initial concept sketch of humanoid bust" labelNumber={1} />
          </li>
        </ol>

        <h3>Results</h3>
        <p>
          By the end of Week 1, I had a sculpted 3D model of a humanoid robotic
          bust. The model captures the expressive qualities of my concept
          sketch while being grounded in technical considerations for
          fabrication. It will serve as the starting point for integrating
          electronics and mechanics in later weeks.
        </p>

        <h3>Learnings</h3>
        <ul>
          <li>Basics of Blender sculpting workflow.</li>
          <li>How AI can expand a hand sketch into rich visual directions.</li>
          <li>AI-to-STL conversions are often rough and require substantial
            manual rebuilding.</li>
          <li>Planning proportions early saves time and prevents major
            corrections later in the pipeline.</li>
        </ul>

        <h3>Reflection</h3>
        <p>
          <strong>What worked:</strong> Combining a hand sketch with AI
          visualization gave a compelling visual reference, and treating the
          file like clay in Blender made sculpting intuitive.
        </p>
        <p>
          <strong>What didn’t work:</strong> The MakerWorld STL conversion was
          low-quality and required rebuilding large portions of the mesh.
        </p>
      </div>
    );
  }

  return ProjectPage({
    title: "Week 1 - Computer-Aided Design",
    content: RenderEnglishContent(),
    params,
  });
}


export function ProjectWeek2(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>
          The goal of this week’s assignment was to design and fabricate a
          parametric iris box construction kit. This project demonstrates:
        </p>
        <ul>
          <li>Parametric design principles in Fusion 360.</li>
          <li>Kerf compensation for precise laser cutting.</li>
          <li>Prototyping across materials (cardboard → wood).</li>
          <li>Hybrid fabrication techniques using both laser cutting and vinyl cutting.</li>
        </ul>

        <h3>Process</h3>
        <ol>
          <li>
            <strong>Designing the Iris Box in Fusion 360</strong>
            <p>
              I built the iris box from scratch in Fusion 360, starting with only
              a rough idea of how the mechanism should work and some quick
              online references. My main challenge was constructing the
              overlapping blades so that they would all rotate smoothly with a
              single motion.
            </p>
            <p>
              Although the short video I recorded only shows the final parts
              being assembled successfully, there were many failed versions
              along the way:
            </p>
            <ul>
              <li>Early blades overlapped incorrectly and jammed instead of rotating.</li>
              <li>Some joints misaligned, causing uneven spacing.</li>
              <li>I had to refresh my knowledge of Fusion assemblies, using joints and motion links so the entire mechanism could be driven by one singular spin movement.</li>
            </ul>
            <p>
              To make the design scalable and reusable, I set up a full list of
              user parameters:
            </p>
            {/* IMAGE: parametric table from fusion i used */}
              <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
                <div style={{flex: '1 1 48%', minWidth: 160}}>
                  <ProjectImage src="/images/Week-2/parametrics.png" alt="Parametric table from Fusion" label="Parametric table" labelNumber={1} />
                  <ProjectImage src="/images/Week-2/parametrics.png" alt="Parametric table from Fusion" label="Parametric table" labelNumber={1} />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 160}}>
                  <ProjectImage src="/images/Week-2/fusion assembled box picture.png" alt="Fusion assembled box" label="Fusion assembled box" />
                  <ProjectImage src="/images/Week-2/fusion assembled box picture.png" alt="Fusion assembled box" label="Fusion assembled box" />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 160}}>
                  <video controls style={{width: '100%', height: '100vh', maxHeight: '100vh', borderRadius: 6, objectFit: 'contain'}}>
                    <source src="/images/Week-2/fusion simulation.mp4" type="video/mp4" />
                    <source src={getPublicPath('/images/Week-2/fusion simulation.mp4')} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div style={{fontSize: 12, color: '#666', marginTop: 6}}>Fusion simulation</div>
                </div>
                <div style={{flex: '1 1 48%', minWidth: 160}}>
                  <video controls style={{width: '100%', height: '100vh', maxHeight: '100vh', borderRadius: 6, objectFit: 'contain'}}>
                    <source src="/images/Week-2/fusion assembly.mp4" type="video/mp4" />
                    <source src={getPublicPath('/images/Week-2/fusion assembly.mp4')} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div style={{fontSize: 12, color: '#666', marginTop: 6}}>Fusion assembly</div>
                </div>
              </div>
            <p>
              This came with a lot of testing calculation, trial and error.
            </p>
            <p>
              Every dimension in my sketches was tied back to these parameters,
              meaning I could update the entire design simply by changing the
              diameter or thickness of material.
            </p>
            {/* IMAGE PLACEHOLDER: Fusion 360 parametric model — Label 1: Parametric design process with user parameters */}
          </li>

          <li>
            <strong>Preparing Cut Files</strong>
            <p>
              Once I had a working iris box design in Fusion 360, I created a
              copy of the file so I could disassemble it without losing the
              original assembly. In this copy:
            </p>
            <ul>
              <li>I laid out all of the individual parts on a single plane.</li>
              <li>I used Fusion’s Project tool to turn the faces of each part into 2D sketches.</li>
              <li>I exported these sketches as a DXF file.</li>
              <li>I imported the DXF into Inkscape to check scaling and alignment.</li>
              <li>From there, I exported the file as an SVG, which is the format required for Adobe Illustrator (the software connected to the laser cutter).</li>
            </ul>
            <p>
              This workflow ensured that my parametric model could be turned into a precise 2D cut file while still keeping the original assembly intact for future changes.
            </p>
            <div style={{marginTop: 8}}>
              <ProjectImage src="/images/Week-2/drawing file.png" alt="Vinyl overlay drawing / cut file" label="Vinyl overlay drawing / cut file" />
                <ProjectImage src="/images/Week-2/drawing file.png" alt="Vinyl overlay drawing / cut file" label="Vinyl overlay drawing / cut file" />
            </div>
          </li>

          <li>
            <strong>Kerf Testing</strong>
            <p>
              At first, I used 0.1 mm as a placeholder for kerf. To measure it properly, I:
            </p>
            <ul>
              <li>Drew a 10 mm × 10 mm test square.</li>
              <li>Cut it on the Fusion Laser (24" × 24") using the preset settings.</li>
              <li>Measured the cut piece with digital calipers.</li>
            </ul>
            <p>
              If the piece measured 9.75 mm instead of 10 mm, that 0.15 mm difference represented the material removed by the laser. Dividing evenly between both sides, the true kerf was 0.1 mm.
            </p>
            <p>
              I then plugged this value into my Fusion parameters so that every slot and joint automatically compensated for the laser cut width.
            </p>
            {/* IMAGE PLACEHOLDER: Kerf test square with caliper measurement */}
        <div style={{marginTop: 8}}>
          <div style={{maxWidth: 480}}>
            <ProjectImage src="/images/Week-2/kerf test.JPG" alt="Kerf test square with caliper measurement" label="Kerf test" />
            <ProjectImage src="/images/Week-2/kerf test.JPG" alt="Kerf test square with caliper measurement" label="Kerf test" />
          </div>
        </div>
          </li>

          <li>
            <strong>Prototyping in Cardboard</strong>
            <p>
              Before committing to wood, I tested the design in cardboard. Unfortunately, I only had access to weak, flimsy cardboard, and it became clear immediately that the material wasn’t rigid enough to stand on its own. The joints flexed, the parts bent, and I couldn’t even fully assemble. This told me that the design would require wood or another rigid material to function as intended.
            </p>
            <p>
              I also experimented with engraving a decorative pattern I found online onto the cardboard. The results were inconsistent: because cardboard isn’t perfectly flat, even slightly raised or warped areas burned at a different rate. The engraving looked patchy and uneven, so I decided to scrap the idea for cardboard.
            </p>
              <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-2/cardboard laser cut.JPG" alt="Cardboard laser cut" label="Cardboard laser cut" />
                  <ProjectImage src="/images/Week-2/cardboard laser cut.JPG" alt="Cardboard laser cut" label="Cardboard laser cut" />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-2/engraved cardboard.JPG" alt="Engraved cardboard" label="Engraved cardboard" />
                  <ProjectImage src="/images/Week-2/engraved cardboard.JPG" alt="Engraved cardboard" label="Engraved cardboard" />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-2/IMG_0163-min.JPG" alt="Assembly / cardboard photo" label="Assembly / cardboard photo" />
                  <ProjectImage src="/images/Week-2/IMG_0163-min.JPG" alt="Assembly / cardboard photo" label="Assembly / cardboard photo" />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-2/top view engraved cardboard.JPG" alt="Top view engraved cardboard" label="Top view (cardboard)" />
                  <ProjectImage src="/images/Week-2/top view engraved cardboard.JPG" alt="Top view engraved cardboard" label="Top view (cardboard)" />
                </div>
                <div style={{flex: '1 1 48%', minWidth: 140}}>
                  <ProjectImage src="/images/Week-2/engraved design.JPG" alt="Engraved design" label="Engraved design" />
                </div>
              </div>
          </li>

          <li>
            <strong>Final Fabrication in Wood</strong>
            <p>
              With kerf values finalized, I cut the iris box in 3 mm plywood on the Fusion Laser (24" × 24"), again using the preset plywood cutting settings.
            </p>
            <p>
              The wood’s rigidity solved the issues I faced with cardboard. The joints came out clean and fit tightly thanks to kerf compensation. I did light sanding on a few pieces to fine-tune the fit.
            </p>
            {/* IMAGE PLACEHOLDER: Laser setup — Label 6 */}
        <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-2/preset laser settings.JPG" alt="Preset laser settings" label="Laser preset settings" />
          </div>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-2/laser wood cut.JPG" alt="Laser cutting wood" label="Laser cutting (wood)" />
          </div>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-2/inside of wooden box.JPG" alt="Inside of wooden box" label="Inside (wooden box)" />
          </div>
          
        </div>
        
            {/* IMAGE PLACEHOLDER: Cutting process — Label 7 */}
            {/* IMAGE PLACEHOLDER: Material prep — Label 8 */}
            {/* IMAGE PLACEHOLDER: Finished cut pieces — Label 9 */}
          </li>

          <li>
            <strong>Assembly & Testing</strong>
            <p>
              I dry-fit the laser-cut parts first, then assembled the full iris mechanism with M3 screws. Thanks to parametric design and kerf compensation, the snap joints were snug and the mechanism rotated smoothly.
            </p>
            <div style={{display: 'flex', gap: 12, marginTop: 8, alignItems: 'flex-start', flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 48%', minWidth: 160}}>
                <ProjectImage src="/images/Week-2/final built box.JPG" alt="Finished cut pieces / final built box" label="Final built box" />
              </div>
              <div style={{flex: '1 1 100%', minWidth: 220}}>
                <video controls style={{width: '100%', height: '100vh', maxHeight: '100vh', borderRadius: 6, objectFit: 'contain'}}>
                  <source src="/images/Week-2/demonstration_video.mp4" type="video/mp4" />
                  <source src={getPublicPath('/images/Week-2/demonstration_video.mp4')} type="video/mp4" />
            <ProjectImage src="/images/Week-2/preset laser settings.JPG" alt="Preset laser settings" label="Laser preset settings" />
            <ProjectImage src="/images/Week-2/laser wood cut.JPG" alt="Laser cutting wood" label="Laser cutting (wood)" />
            <ProjectImage src="/images/Week-2/inside of wooden box.JPG" alt="Inside of wooden box" label="Inside (wooden box)" />
            <ProjectImage src="/images/Week-2/final built box.JPG" alt="Finished cut pieces / final built box" label="Final built box" />
                  Your browser does not support the video tag.
                </video>
                <div style={{fontSize: 12, color: '#666', marginTop: 6}}>Demonstration: iris opening/closing</div>
              </div>
            </div>
          </li>

          <li>
            <strong>Vinyl Overlay Finishing</strong>
            <p>
              To elevate the look of the final piece, I used a Cricut vinyl cutter to create a decorative overlay for the top panel. The goal was to cover the holes used for the joints, while not sacrificing the wooden look. Applying the vinyl was trickier than expected — alignment took multiple attempts — but the final result added a professional finish to the iris box.
            </p>
            <div style={{marginTop: 8}}>
              <ProjectImage src="/images/Week-2/IMG_0168-min.JPG" alt="Vinyl overlay applied / assembly photo 2" label="Vinyl overlay / assembly photo 2" />
            </div>
          </li>
        </ol>

        <h3>Results</h3>
        <p>
          The final parametric iris box was fully functional and aesthetically refined:
        </p>
        <ul>
          <li>The iris mechanism opened and closed smoothly.</li>
          <li>Joints fit tightly with minimal sanding required.</li>
          <li>Vinyl finishing added a clean, professional look.</li>
          <li>The Fusion 360 parametric model can be easily scaled for different sizes or materials.</li>
        </ul>
        {/* IMAGE PLACEHOLDER: Final wooden iris box — Label 3: Assembled iris box in wood */}

        <h3>Learnings</h3>
        <ul>
          <li>Parametric modeling in Fusion 360 is powerful for quickly iterating designs, but quite annoying to set up if you want to make each parameter dependent on another.</li>
          <li>Accurate kerf testing is essential for tight joints.</li>
          <li>Prototyping in cardboard is useful for cut checks, but mechanical designs like this demand sturdier materials.</li>
          <li>Vinyl finishing can add polish but requires patience to align properly.</li>
        </ul>

        <h3>Reflection</h3>
        <p>
          <strong>What worked:</strong> Parametric setup made iteration simple. Kerf compensation values were accurate. The final wooden version functioned smoothly.
        </p>
        <p>
          <strong>What didn’t work:</strong> Weak cardboard made for a poor prototype. Initial kerf placeholder values needed real testing. Vinyl alignment required retries.
        </p>

        <h3>Files</h3>
        <ul>
          <li>Fusion 360 Parametric File</li>
          <li>Laser Cut SVG/DXF</li>
          <li>Vinyl Overlay SVG</li>
        </ul>
      </div>
    );
  }

  return ProjectPage({
    title: "Week 2 - Computer-Controlled Cutting",
    content: RenderEnglishContent(),
    params,
  });
}


export function ProjectWeek3(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>
          This week’s goal was to program a microcontroller board and test different ways of interacting with it. The focus was on learning how to load code onto custom hardware, troubleshoot errors, and begin exploring how embedded systems can be integrated into larger projects.
        </p>

        <h3>Process</h3>
        <ol>
          <li>
            <strong>Starting with the QPAD21</strong>
            <p>
              I began by soldering the QPAD21 board in lab, using my preferred workflow for small SMD parts:
            </p>
            <ul>
              <li>Applied solder paste to pads to hold components in place.</li>
              <li>Used a soldering iron to spot-solder anchor points.</li>
              <li>Finished with a heat gun reflow for clean joints.</li>
            </ul>
            <p>
              Despite neat soldering, the QPAD21 presented a mysterious failure. Quentin and I checked for shorts and continuity, but the board would not function, meaning I couldn’t move forward with programming on it.
            </p>
            <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 48%', minWidth: 160}}>
                <ProjectImage src="/images/Week-3/QPAD21.JPG" alt="QPAD21 board" label="QPAD21 board" />
              </div>
              <div style={{flex: '1 1 48%', minWidth: 160}}>
                <ProjectImage src="/images/Week-3/soldering.JPG" alt="Soldering process" label="Soldering" />
              </div>
            </div>
          </li>

          <li>
            <strong>Switching to QPAD-XIAO</strong>
            <p>
              To continue, I switched to the QPAD-XIAO, a known working board with a similar architecture. This allowed me to move ahead with programming tasks without getting stuck troubleshooting hardware.
            </p>
            <div style={{marginTop: 8}}>
              <ProjectImage src="/images/Week-3/QPAD XAIO.JPG" alt="QPAD XIAO board" label="QPAD-XIAO board" />
            </div>
          </li>

          <li>
            <strong>Learning Arduino IDE code via Quentin’s Examples</strong>
            <p>
              With the QPAD-XIAO, I set up the Arduino IDE and tested Quentin’s simple programs to determine what I was working with:
            </p>
            <ul>
              <li>
                <strong><code>blink_RP2040.ino</code></strong>
                <p>I learned how to control GPIO pins on the RP2040. I found out the onboard RGB LED is wired active-low (HIGH = off, LOW = on).</p>
              </li>
              <li>
                <strong><code>test_display_RP2040.ino</code></strong>
                <p>I learned how to set up and communicate with an OLED screen over I2C, using the Adafruit GFX and SSD1306 libraries to draw text and manage the framebuffer.</p>
              </li>
              <li>
                <strong><code>test_touch_RP2040.ino</code></strong>
                <p>I learned how capacitive touch sensing works by timing how long it takes a pin to rise and experimented with thresholds; Serial output was useful for debugging touch values.</p>
              </li>
              <li>
                <strong><code>test_serial_RP2040.ino</code></strong>
                <p>I learned how to read characters from the Serial monitor, buffer input, and echo typed input back — a simple but crucial I/O pattern for debugging and interactive controls.</p>
              </li>
            </ul>

            <p>Most important notes from the "Advanced" link code:</p>
            <ul>
              <li><strong>Frame-based communication:</strong> use start/end markers (e.g. 0x7E), escape special bytes, and decode the stream before using it.</li>
              <li><strong>OLED handling:</strong> SSD1306 uses a 1024-byte framebuffer (128 × 64 ÷ 8); writing the full buffer then calling display.display() updates the screen in one shot.</li>
              <li><strong>Touch input:</strong> measure charge time (drive LOW → switch to INPUT_PULLUP → time to rise), compare to thresholds, and pack multiple pads into a bitmask byte.</li>
              <li><strong>Two-way link:</strong> computer sends a full 1024-byte frame; board displays it and replies with a 1-byte touch bitmask each loop.</li>
              <li><strong>Buffer sizes:</strong> input buffers need to accommodate escaped frames (~2500 bytes); OLED output buffer is fixed at 1024 bytes.</li>
            </ul>
            <div style={{marginTop: 8}}>
              <ProjectImage src="/images/Week-3/programmer.JPG" alt="Programmer setup" label="Programmer / development" />
            </div>
          </li>

          <li>
            <strong>Running a simple end-to-end test</strong>
            <p>
              I wrote a Python script (<code>send_checkerboard.py</code>) to generate a checkerboard in NumPy, convert it to 1024 bytes (SSD1306 format), HDLC-encode it, and send it over USB Serial. When the OLED updated with the checkerboard, the link was confirmed working.
            </p>
            <div style={{marginTop: 8}}>
              <video controls style={{width: '100%', height: '100vh', maxHeight: '100vh', borderRadius: 6, objectFit: 'contain'}}>
                <source src="/images/Week-3/my program.mp4" type="video/mp4" />
                <source src={getPublicPath('/images/Week-3/my program.mp4')} type="video/mp4" />
                <ProjectImage src="/images/Week-3/QPAD21.JPG" alt="QPAD21 board" label="QPAD21 board" />
                <ProjectImage src="/images/Week-3/soldering.JPG" alt="Soldering process" label="Soldering" />
                <ProjectImage src="/images/Week-3/QPAD XAIO.JPG" alt="QPAD XIAO board" label="QPAD-XIAO board" />
                <ProjectImage src="/images/Week-3/programmer.JPG" alt="Programmer setup" label="Programmer / development" />
                Your browser does not support the video tag.
              </video>
              <div style={{fontSize: 12, color: '#666', marginTop: 6}}>End-to-end test: Python → OLED</div>
            </div>
          </li>

          <li>
            <strong>Adding interactivity</strong>
            <p>
              I tested <code>send_checkerboard_interactive.py</code>, which read one byte back from the board representing touch state. This proved the system was bidirectional: Python could stream frames down while the board sent touch data back up.
            </p>
          </li>

          <li>
            <strong>Creating the rotating text</strong>
            <p>
              I installed pygame to render text in Python. Using a font render of "HAYLEY" I extracted pixel coordinates, optionally kept edges, built a 3D point cloud (z=0), rotated points each frame, projected them into 2D, rasterized into a 128×64 boolean image, and sent the frame buffer to the board over HDLC.
            </p>
          </li>

          <li>
            <strong>Iterative adjustments</strong>
            <p>
              I tuned thickness, stride, scaling, projection, and orientation so the spinning text filled the screen and remained readable. Small parameter changes (THICK, stride, sx/sy, z_shift, focal) made the biggest visual difference.
            </p>
          </li>

          <li>
            <strong>Final outcome</strong>
            <p>
              The OLED now shows "HAYLEY" spinning in 3D, and the capacitive touch pads can pause, invert, or adjust the spin. The system demonstrates both local interaction (touch, OLED) and remote communication (Python streaming frames over Serial).
            </p>
          </li>
        </ol>

        <h3>Results</h3>
        <ul>
          <li>
            <strong>QPAD21:</strong> I successfully soldered the board but it failed to function despite checks for shorts and continuity, blocking programming on that hardware.
          </li>
          <li>
            <strong>QPAD-XIAO:</strong> Switching to this board allowed me to run test sketches and verify GPIO, OLED, touch sensing, and Serial I/O.
          </li>
          <li>
            <strong>Programming pipeline:</strong> Arduino IDE for firmware, Python + NumPy + Pygame for image generation, and HDLC encoding for reliable frame transport.
          </li>
          <li>
            <strong>End-to-end demo:</strong> streamed patterns and rotating "HAYLEY" text from Python to the OLED while reading touch input back.
          </li>
        </ul>

        <h3>Learnings</h3>
        <ul>
          <li>Hardware fragility: even well-soldered boards can fail due to subtle trace or component issues; backups save time.</li>
          <li>Start simple: blink and serial sketches establish a baseline before complex protocols.</li>
          <li>Frame-based comms: encoding images as a fixed 1024-byte buffer with delimiters and escaping is robust for embedded links.</li>
          <li>OLED workflow: direct framebuffer writes plus display.display() let you stream complex animations.</li>
          <li>Touch input: compact single-byte encoding (bitmask) is efficient for multiple capacitive pads.</li>
          <li>Iteration matters: small math and parameter tweaks made the animation readable and visually satisfying.</li>
        </ul>

        <h3>Reflection</h3>
        <p>
          <strong>What worked:</strong> my soldering workflow and switching to QPAD-XIAO allowed steady progress; Python-to-board integration unlocked complex animations.
        </p>
        <p>
          <strong>What didn’t work:</strong> QPAD21 failure stalled hardware progress and needs further debugging.
        </p>
        <p>
          <strong>Looking forward:</strong> embedded devices as satellite displays and interactive companions — blending local interactivity with external logic (AI, simulations, music) is the next step.
        </p>
      </div>
    );
  }

  return ProjectPage({title: 'Week 3 - Electronics Production', content: RenderEnglishContent(), params});
}

export function ProjectWeek4(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>
          The goal this week was to practice additive fabrication and digital scanning. I wanted to push forward my Week 1 humanoid bust concept by turning the digital design into a physical object, using 3D printing as a way to get a reference maquette that I can continue sculpting and iterating on.
        </p>

        <h3>Process</h3>

        <h4>Revisiting the Bust from Week 1</h4>
        <p>
          I started with the humanoid bust I had modeled during Week 1, which combined ideas of mechanical and sculptural forms. My intent was not just to print it as-is, but to use the 3D print as a physical reference model as I refine the design into a larger piece.
        </p>
        <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-4/bust stl.png" alt="Week 1 bust STL / render" label="Week 1 bust STL" />
                <ProjectImage src="/images/Week-4/bust stl.png" alt="Week 1 bust STL / render" label="Week 1 bust STL" />
          </div>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-4/bust and head.JPG" alt="Bust and head render" label="Bust and head" />
                <ProjectImage src="/images/Week-4/bust and head.JPG" alt="Bust and head render" label="Bust and head" />
          </div>
        </div>

        <h4>Preparing the Model in Blender</h4>
        <p>
          The STL exported from Week 1 wasn’t immediately ready to print — it had issues with mesh geometry. I used Blender to inspect and repair the model:
        </p>
        <ul>
          <li>Flattened the base so the bust could stand upright without support.</li>
          <li>Cleaned up vertices and removed loose interior geometry that would confuse the slicer.</li>
          <li>Closed holes and ensured the shell was watertight.</li>
          <li>Thickened thin areas that would otherwise fail on the printer.</li>
        </ul>
        <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-4/head1.JPG" alt="Blender mesh cleanup" label="Blender cleanup" />
          </div>
          <div style={{flex: '1 1 48%', minWidth: 160}}>
            <ProjectImage src="/images/Week-4/bust stl.png" alt="STL insights" label="STL / mesh" />
          </div>
        </div>

        <h4>3D Printing on the Bambu Lab A1 Mini</h4>
        <p>
          I sliced the model using Bambu Studio and sent it to the A1 Mini printer. Print settings: supports enabled for overhangs and PLA filament. The flat base made bed adhesion easy, and the print completed smoothly without major defects.
        </p>
        <p>
          I printed a small scale model of my humanoid bust, then used Bambu Studio to cut just the head so I could scale it up and print the head on the A1 Mini build plate.
        </p>
        <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/head printing.JPG" alt="Head printing on A1 Mini" label="Head printing" />
          </div>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/bust print 1.JPG" alt="Bust print 1" label="Bust print 1" />
          </div>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/bust print 2.JPG" alt="Bust print 2" label="Bust print 2" />
          </div>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/bust print 3.JPG" alt="Bust print 3" label="Bust print 3" />
          </div>
        </div>

        <h4>3D Scanning</h4>
        <p>
          After printing my small scale bust, I used a RevoPoint Pop 3 Plus to scan the print. I captured a very accurate scan after testing distance and angles and using an electrical rotating base to capture all sides without losing frame alignment.
        </p>
        <p>
          I did need to re-run a few scans to capture undercuts (the underside under the chin was not perfect) and I did some mesh repairs after importing the scan into my workflow.
        </p>
        <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/scan.JPG" alt="Scan screenshot" label="Scan 1" />
          </div>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/scan 2.JPG" alt="Scan screenshot 2" label="Scan 2" />
          </div>
          <div style={{flex: '1 1 30%', minWidth: 140}}>
            <ProjectImage src="/images/Week-4/scan 3.JPG" alt="Scan screenshot 3" label="Scan 3" />
          </div>
        </div>

        <h3>Outcome</h3>
        <ul>
          <li>The bust successfully printed and now serves as a tangible reference.</li>
          <li>The "to-scale" head printed successfully and provided new insights about proportions and balance.</li>
          <li>This iteration prepared me for future prints with more refined geometry or different materials.</li>
        </ul>

        <h3>Results</h3>
        <ul>
          <li>Produced a small-scale humanoid bust as a reference model for larger sculptural work.</li>
          <li>Fixed Blender mesh issues (vertices, hollow geometry, flat base).</li>
          <li>Printed successfully on a Bambu Lab A1 Mini using Bambu Studio.</li>
        </ul>

        <h3>Learnings</h3>
        <ul>
          <li>Even finished-looking 3D models often need extra prep for printing: cleaning vertices, flattening bases, and ensuring closed shells.</li>
          <li>Bambu Studio + A1 Mini is a reliable workflow for fast prototyping at high resolution.</li>
          <li>Physical prints give design insights that are hard to get digitally, making them an essential tool in iteration.</li>
        </ul>

        <h3>Reflection</h3>
        <p>
          <strong>What worked:</strong> Carrying forward my Week 1 bust project tied assignments together and gave me a real physical checkpoint. The A1 Mini produced a clean, detailed print.
        </p>
        <p>
          <strong>What didn’t work:</strong> Fixing the STL in Blender was more work than expected — the original geometry wasn’t print-ready.
        </p>
        <p>
          <strong>Looking ahead:</strong> I’d like to try rescanning the bust to compare the digital vs. physical model, and eventually print larger versions or experiment with different materials.
        </p>
      </div>
    );
  }

  return ProjectPage({title: 'Week 4 - 3D Printing & Scanning', content: RenderEnglishContent(), params});
}

export function ProjectWeek5(params: SubViewParams) {
  function RenderEnglishContent() {
    return (
      <div>
        <h3>Project Goal</h3>
        <p>
          Short statement of the week's objective. (Replace this with your Week 5 goal.)
        </p>

        <h3>Process</h3>
        <ol>
          <li>
            <strong>Kickoff & Research</strong>
            <p>Summarize initial research, references, and early design choices.</p>
          </li>

          <li>
            <strong>Design & Prototype</strong>
            <p>Describe the prototyping approach and tools used.</p>
            <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
              <div style={{flex: '1 1 48%', minWidth: 140}}>
                <ProjectImage src="/images/Week-5/IMG_0371-min.JPG" alt="Prototype photo 1" label="Prototype photo 1" />
              </div>
              <div style={{flex: '1 1 48%', minWidth: 140}}>
                <ProjectImage src="/images/Week-5/IMG_0370-min.JPG" alt="Prototype photo 2" label="Prototype photo 2" />
              </div>
            </div>
          </li>

          <li>
            <strong>Testing</strong>
            <p>Explain test methodology and key observations.</p>
            <div style={{marginTop: 8}}>
              <div style={{fontSize: 14, color: '#666'}}>No demo video found for Week 5 — showing prototype photos above.</div>
            </div>
          </li>
        </ol>

        <h3>Results</h3>
        <ul>
          <li>Key outcome 1</li>
          <li>Key outcome 2</li>
        </ul>

        <h3>Learnings</h3>
        <ul>
          <li>Learning 1</li>
          <li>Learning 2</li>
        </ul>

        <h3>Reflection</h3>
        <p><strong>What worked:</strong> ...</p>
        <p><strong>What didn’t work:</strong> ...</p>

        <h3>Files</h3>
        <ul>
          <li>Design file</li>
          <li>Exported assets</li>
        </ul>
      </div>
    );
  }

  return ProjectPage({title: 'Week 5 - Prototype & Test', content: RenderEnglishContent(), params});
}
