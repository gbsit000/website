const style = {
  overlay: `bg-black fixed h-screen left-0 opacity-40 top-0 w-screen z-30 lg:hidden`,
};
export default function Overlay({ open, onClick }) {
  return <div className={open ? style.overlay : ""} onClick={onClick} />;
}
