export function PlanButton({
  title,
  price,
  extra = null,
  ...props
}: {
  title: string;
  price: string;
  extra?: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="group border w-full shadow-sm border-solid border-neutral-300 p-4 py-6 grid gap-2 rounded-xl content-start dark:border-0 dark:border-neutral-800 dark:bg-neutral-800/90 focus:outline-none hover:scale-[1.025] aria-[current=true]:scale-105 transition-transform aria-[current=true]:border-blue-400 aria-[current=true]:bg-blue-50 aria-[current=true]:shadow-md aria-[current=true]:shadow-blue-600/20 aria-[current=true]:dark:border-blue-300 aria-[current=true]:dark:bg-gradient-to-b aria-[current=true]:dark:from-blue-500 aria-[current=true]:dark:to-blue-700 text-neutral-800 dark:text-neutral-300 aria-[current=true]:text-blue-600 aria-[current=true]:dark:text-neutral-100 relative bg-white"
    >
      <h2 className={`text-base font-bold -mt-1`}>{title}</h2>
      <span className="text-base">{price}</span>
      {extra}
    </button>
  );
}
