const VARIANTS = {
  primary: 'bg-navy text-cream hover:bg-navy-light',
  secondary: 'bg-white text-navy border-2 border-navy/20 hover:border-navy/50',
  peach: 'bg-peach text-navy hover:bg-peach-dark',
  ghost: 'bg-transparent text-navy/70 hover:text-navy underline underline-offset-4',
};

export default function Button({ as: As = 'button', variant = 'primary', className = '', children, ...props }) {
  return (
    <As
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant] || VARIANTS.primary,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </As>
  );
}
