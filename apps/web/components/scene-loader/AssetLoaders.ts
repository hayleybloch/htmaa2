import { AmbientLight, Box3, BufferGeometry, Color, DirectionalLight, DoubleSide, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, Scene, Texture } from "three";
import { AssetLoader, AssetManagerContext, OptionalUpdateAction } from "./AssetManager";
import { AssetKeys } from "./AssetKeys";
import { RendererScenes } from "../renderer/Renderer";
import { isSafari } from "../renderer/util";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { degToRad } from "three/src/math/MathUtils";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

// Helper function to get the correct asset path
function getAssetPath(path: string): string {
  // Hardcode the base path for GitHub Pages deployment
  const prefix = "/htmaa2";
  const fullPath = `${prefix}${path}`;
  console.log(`getAssetPath (components): ${path} -> ${fullPath} (hardcoded prefix: "${prefix}")`);
  return fullPath;
}

export const DisplayParentName = "DisplayParent";
export const DisplayName = "Display";
const MonitorName = "Monitor";
const ComputerName = "Computer";
const DeskName = "Desk";
const NamePlateName = "NamePlate";
const FloorName = "Floor";

async function loadTexture(context: AssetManagerContext, asset: string): Promise<Texture> {
  console.log(`loadTexture called with: ${asset}`);
  const texture = await context.textureLoader.loadAsync(asset);

  texture.flipY = false;

  return texture;
}

async function loadModel(context: AssetManagerContext, asset: string): Promise<GLTF> {
  console.log(`loadModel called with: ${asset}`);
  return await context.gltfLoader.loadAsync(asset);
}

function enableCameraCollision(asset: GLTF): void {
  for (const obj of asset.scene.children) {
    obj.userData[AssetKeys.CameraCollidable] = true;
  }
}

export function createRenderScenes(): RendererScenes {
  const sourceScene = new Scene();

  // The SAOPass doesn't work if the background is 0xFFFFFF, so we opt for 0xFEFEFE instead
  // I thought it came due to the cutout shader, but it doesn't seem to have any effect on it.
  sourceScene.background = new Color(0xFEFEFE);

  return {
    sourceScene,
    cutoutScene: new Scene(),
    cssScene: new Scene()
  };
}

function transformWebUrlToDesktop(webUrl: string): string {
  const parts = webUrl.split('-');

  const index = parts.findIndex(x => x === 'web');
  parts[index] = 'desktop';

  return 'https://' + parts.join('-');
}

function getDesktopTargetUrl(): string {
  // Use configurable desktop URL instead of hardcoded Vercel URL
  const desktopUrl = process.env.NEXT_PUBLIC_DESKTOP_URL;
  
  if (desktopUrl) {
    return desktopUrl;
  }
  
  // Use production URL for GitHub Pages deployment
  const target = process.env.NEXT_PUBLIC_TARGET_URL ?? 'https://hayleybloch.github.io/htmaa2/'
  return target;
}

function getDesktopTarget(debug: boolean): string {
  const url = getDesktopTargetUrl();

  if (!debug) { return url; }

  return `${url}/?debug`;
}

export function NoopLoader(): AssetLoader {
  return {
    downloader: null,
    builder: null,
    builderProcessTime: 0
  }
}

export function LightsLoader(): AssetLoader {
  function builder(context: AssetManagerContext): OptionalUpdateAction {
    const ambientLight = new AmbientLight(0x404040);
    ambientLight.intensity = 4;
    context.scenes.sourceScene.add(ambientLight);

    // Add directional light from front right for shadows
    const directionalLight = new DirectionalLight(0xffffff, 0.3); // Reduced intensity
    directionalLight.position.set(8, 12, 3); // Front right position, higher up
    directionalLight.target.position.set(5, 0, -1); // Point towards the bust area
    directionalLight.castShadow = true;
    
    // Configure shadow properties for softer shadows
    directionalLight.shadow.mapSize.width = 1024; // Reduced resolution for softer edges
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
    directionalLight.shadow.radius = 10; // Soft shadow radius
    
    context.scenes.sourceScene.add(directionalLight);
    context.scenes.sourceScene.add(directionalLight.target);

    return null;
  }

  return {
    downloader: null,
    builder,
    builderProcessTime: 0
  }
}

export function FloorLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, getAssetPath('/assets/SmoothFloor.jpg')); }
    const assetLoader   = async () => { asset = await loadModel(context, getAssetPath('/assets/SmoothFloor.glb')); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!texture) { return null; }
    if (!asset) { return null; }

    enableCameraCollision(asset);

    context.scenes.sourceScene.add(asset.scene);

    const material = new MeshBasicMaterial({ map: texture });
    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
      
      // Enable shadows for the floor
      node.receiveShadow = true;
    });

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function DeskLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, getAssetPath('/assets/Desk.jpg')); }
    const assetLoader   = async () => { asset = await loadModel(context, getAssetPath('/assets/Desk.glb')); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!texture) { return null; }
    if (!asset) { return null; }

    for (const obj of asset.scene.children) {
      obj.userData[AssetKeys.CameraCollidable] = true;
    }

    const material = new MeshLambertMaterial({ 
      map: texture,
      color: 0xf0f0f0, // Light gray color to make it lighter
    });
    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      if (node.name === DeskName) {
        node.material = material;
      }
      
      // Enable shadows for the desk
      node.receiveShadow = true;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function MonitorLoader(): AssetLoader {
  let monitorTexture: Texture | null = null;
  let computerTexture: Texture | null = null;
  let namePlateTexture: Texture | null = null;

  let asset: GLTF | null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const monitorLoader   = async () => { monitorTexture = await loadTexture(context, getAssetPath('/assets/Monitor.jpg')); }
    const computerLoader  = async () => { computerTexture = await loadTexture(context, getAssetPath('/assets/Computer.jpg')); }
    const namePlateLoader = async () => { namePlateTexture = await loadTexture(context, getAssetPath('/assets/NamePlate.jpg')); }
    const assetLoader     = async () => { asset = await loadModel(context, getAssetPath('/assets/Monitor.glb')); }

    await Promise.all([monitorLoader(), computerLoader(), namePlateLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!monitorTexture || !computerTexture) { return null; }

    asset.scene.name = DisplayParentName;

    const displayMaterial = new MeshBasicMaterial({ color: 0x000000 });
    displayMaterial.stencilWrite = true;
    displayMaterial.transparent = true;

    const monitorMaterial   = new MeshBasicMaterial({ map: monitorTexture });
    const computerMaterial  = new MeshBasicMaterial({ map: computerTexture });
    const nameplateMaterial = new MeshBasicMaterial({ map: namePlateTexture });

    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      switch (node.name) {
        case DisplayName:
          node.material = displayMaterial;
          break;
        case MonitorName:
          node.material = monitorMaterial;
          break;
        case ComputerName:
          node.material = computerMaterial;
          break;
        case NamePlateName:
          node.material = nameplateMaterial;
          break;
      }
    });

    const display = asset.scene.children.find((x) => x.name === DisplayName) as Mesh<BufferGeometry, Material>;
    const cutoutDisplay = display.clone();
    display.visible = false;

    const box = display.geometry.boundingBox ?? new Box3();

    const pageWidth = 1280;
    const pageHeight = 980;

    // Use a slightly higher margin on Safari, as 0.1 gives white lines and 0.2 is too big for other browser to look nice.
    const margin = isSafari() ? 0.2 : 0.1;

    const width   = (box.max.x - box.min.x) + margin;
    const height  = width * (pageHeight / pageWidth);
    const depth   = (box.max.z - box.min.z);

    const planeHeight = Math.sqrt(Math.pow(depth, 2) + Math.pow(height, 2));

    const viewHeightScale = planeHeight / pageHeight;
    const viewWidthScale  = width / pageWidth;

    // TODO: Calculate the correct aspect ratio for the content
    const container = document.createElement('div');
    container.style.width = `${pageWidth}px`;
    container.style.height = `${pageHeight}px`;

    const iframe = document.createElement('iframe');
    iframe.id = 'operating-system-iframe';
    iframe.classList.add("iframe-container");
    iframe.style.width = `100%`;
    iframe.style.height = `100%`;
    iframe.style.backgroundColor = 'black';
    iframe.style.boxSizing = 'border-box';
    iframe.style.padding = '32px';

    iframe.src = getDesktopTarget(context.debug);

    container.appendChild(iframe);
    const cssPage = new CSS3DObject(container);

    const [localX, localY, localZ] = [
      (box.min.x - margin / 2) + width / 2,
      (box.min.y - margin / 2) + height / 2,
      box.min.z + depth / 2
    ];

    const [x, y, z] = [
      cutoutDisplay.position.x + localX,
      cutoutDisplay.position.y + localY,
      cutoutDisplay.position.z + localZ
    ];

    cssPage.position.set(x, y, z)

    cssPage.scale.set(viewWidthScale, viewHeightScale, 1);
    cssPage.rotateX(Math.atan(height / depth) - degToRad(90));

    context.scenes.cssScene.add(cssPage);
    context.scenes.sourceScene.add(asset.scene);
    context.scenes.cutoutScene.add(cutoutDisplay);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 250
  }
}

export function KeyboardLoader(): AssetLoader {
  let caseTexture: Texture | null = null;
  let keyCapTexture: Texture | null = null;

  let asset: GLTF | null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const caseTextureLoader   = async () => { caseTexture = await loadTexture(context, getAssetPath('/assets/KeyboardCase.jpg')); }
    const keyCapTextureLoader = async () => { keyCapTexture = await loadTexture(context, getAssetPath('/assets/KeyboardKeyCaps.jpg')); }

    const assetLoader = async () => { asset = await loadModel(context, getAssetPath('/assets/Keyboard.glb')); }

    await Promise.all([
      caseTextureLoader(),
      keyCapTextureLoader(),
      assetLoader()
    ]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!caseTexture || !keyCapTexture) { return null; }

    enableCameraCollision(asset);

    const caseMaterial    = new MeshBasicMaterial({ map: caseTexture });
    const keyCapMaterial  = new MeshBasicMaterial({ map: keyCapTexture });

    asset.scene.traverse((node) => {
      if (!(node instanceof Mesh)) { return; }

      if (node.name === "Case") {
        node.material = caseMaterial;
      } else {
        node.material = keyCapMaterial;
      }
    })

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function MouseLoader(): AssetLoader {
  let texture: Texture | null = null;
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const textureLoader = async () => { texture = await loadTexture(context, getAssetPath('/assets/Mouse.jpg')); }
    const assetLoader = async () => { asset = await loadModel(context, getAssetPath('/assets/Mouse.glb')); }

    await Promise.all([textureLoader(), assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }
    if (!texture) { return null; }

    const material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function CablesLoader(): AssetLoader {
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    asset = await loadModel(context, getAssetPath('/assets/Cables.gltf'));
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    const material = new MeshBasicMaterial({ color: 0x303030 });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

// Updated to use Bust instead of Hydra
export function BustLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const assetLoader = async () => { asset = await loadModel(context, getAssetPath('/assets/Bust.glb')); }
    const textureLoader = async () => { texture = await loadTexture(context, getAssetPath('/assets/Bust.jpg')); }

    await Promise.all([assetLoader(), textureLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    let material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
      node.material.side = DoubleSide; // We need to do this, otherwise the ears are transparent
      
      // Enable shadows for the bust
      node.castShadow = true;
      node.receiveShadow = true;
    });

    // Position the bust on the table to the right of the desktop
    asset.scene.position.set(5.5, 7, -1.2); // x: right of desk, y: on table height, z: slightly back
    asset.scene.rotation.y = Math.PI / .75; // Rotate 90 degrees on Z axis
    asset.scene.scale.setScalar(0.35); // Scale down to 35% of original size

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function PlantLoader(): AssetLoader {
  let asset: GLTF | null = null;
  let texture: Texture | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const assetLoader = async () => { asset = await loadModel(context, getAssetPath('/assets/Plant.glb')); }
    const textureLoader = async () => { texture = await loadTexture(context, getAssetPath('/assets/Plant.jpg')); }

    await Promise.all([assetLoader(), textureLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    let material = new MeshBasicMaterial({ map: texture });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      node.material = material;
    });

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}

export function IrisLoader(): AssetLoader {
  let asset: GLTF | null = null;

  async function downloader(context: AssetManagerContext): Promise<void> {
    const assetLoader = async () => { asset = await loadModel(context, getAssetPath('/assets/Iris.glb')); }

    await Promise.all([assetLoader()]);
  }

  function builder(context: AssetManagerContext): OptionalUpdateAction {
    if (!asset) { return null; }

    // Create a wood material with minimal shading
    const woodMaterial = new MeshBasicMaterial({ 
      color: 0xf0cda9 // Very light wood color
    });

    asset.scene.traverse(node => {
      if (!(node instanceof Mesh)) { return; }

      // Force apply the wood material to all meshes
      node.material = woodMaterial;
      
      // Enable shadows for the iris
      node.castShadow = true;
      node.receiveShadow = true;
    });

    // Position the iris on the table - adjust these values as needed
    asset.scene.position.set(-5, 5.9, .5); // x: left of desk, y: on table height, z: slightly back
    asset.scene.rotation.y = Math.PI / 4; // Rotate 45 degrees
    asset.scene.scale.setScalar(0.01); // Scale down to 10% of original size

    // Add subtle ambient light around the iris for better depth perception
    const irisLight = new AmbientLight(0xffffff, 0.3);
    irisLight.position.copy(asset.scene.position);
    context.scenes.sourceScene.add(irisLight);

    context.scenes.sourceScene.add(asset.scene);

    return null;
  }

  return {
    downloader,
    builder,
    builderProcessTime: 0
  }
}
