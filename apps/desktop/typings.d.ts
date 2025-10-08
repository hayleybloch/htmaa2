// Type declarations for CSS modules and static assets used in the desktop app
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.css';
declare module '*.scss';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  const content: any;
  export default content;
}

// Allow importing video files used in some pages
declare module '*.mp4';
declare module '*.webm';
