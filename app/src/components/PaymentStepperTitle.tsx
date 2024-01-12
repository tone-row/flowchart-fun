import classNames from "classnames";

export function PaymentStepperTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={classNames(
        `text-xl font-bold dark:text-neutral-100 text-wrap-balance leading-tight flex items-center justify-center gap-4 ${className}`
      )}
    >
      {children}
    </h2>
  );
}
