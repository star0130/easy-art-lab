export default function Character({ src, alt, size = 140, className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain drop-shadow-sm select-none ${className}`}
      draggable={false}
    />
  );
}
