export function BlueButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`bg-blue-500 text-white px-6 py-3 font-bold rounded flex gap-2 items-center hover:bg-blue-600 focus:outline-none disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
