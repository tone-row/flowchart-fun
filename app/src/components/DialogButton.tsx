import { X } from "phosphor-react";
import { forwardRef } from "react";

const buttonColors = {
  neutral:
    "bg-neutral-200 hover:bg-neutral-300 focus:ring-neutral-200 active:bg-neutral-400 text-neutral-800 hover:text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:ring-neutral-700 dark:active:bg-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-100",
  red: "bg-red-200 hover:bg-red-300 focus:ring-red-200 active:bg-red-400 text-red-800 hover:text-red-900 dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-700 dark:active:bg-red-600 dark:text-red-200 dark:hover:text-red-100",
  blue: "bg-blue-200 hover:bg-blue-300 focus:ring-blue-200 active:bg-blue-400 text-blue-800 hover:text-blue-900 dark:bg-blue-800 dark:hover:bg-blue-700 dark:focus:ring-blue-700 dark:active:bg-blue-600 dark:text-blue-200 dark:hover:text-blue-100",
  orange:
    "bg-orange-200 hover:bg-orange-300 focus:ring-orange-200 active:bg-orange-400 text-orange-800 hover:text-orange-900 dark:bg-orange-800 dark:hover:bg-orange-700 dark:focus:ring-orange-700 dark:active:bg-orange-600 dark:text-orange-200 dark:hover:text-orange-100",
  green:
    "bg-green-200 hover:bg-green-300 focus:ring-green-200 active:bg-green-400 text-green-800 hover:text-green-900 dark:bg-green-800 dark:hover:bg-green-700 dark:focus:ring-green-700 dark:active:bg-green-600 dark:text-green-200 dark:hover:text-green-100",
  purple:
    "bg-purple-200 hover:bg-purple-300 focus:ring-purple-200 active:bg-purple-400 text-purple-800 hover:text-purple-900 dark:bg-purple-800 dark:hover:bg-purple-700 dark:focus:ring-purple-700 dark:active:bg-purple-600 dark:text-purple-200 dark:hover:text-purple-100",
  zinc: "bg-zinc-200 hover:bg-zinc-300 focus:ring-zinc-200 active:bg-zinc-400 text-zinc-800 hover:text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:focus:ring-zinc-700 dark:active:bg-zinc-600 dark:text-zinc-200 dark:hover:text-zinc-100",
  inverted:
    "bg-neutral-700 hover:bg-neutral-800 focus:ring-neutral-800 active:bg-neutral-900 text-neutral-100 hover:text-neutral-200 dark:bg-neutral-200 dark:hover:bg-neutral-300 dark:focus:ring-neutral-300 dark:active:bg-neutral-400 dark:text-neutral-800 dark:hover:text-neutral-900",
};

type PropsOf<
  C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>
> = JSX.LibraryManagedAttributes<C, React.ComponentPropsWithoutRef<C>>;

type ExtendableProps<ExtendedProps = {}, OverrideProps = {}> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

type InheritableElementProps<
  C extends React.ElementType,
  Props = {}
> = ExtendableProps<PropsOf<C>, Props>;

type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = InheritableElementProps<C, Props & AsProp<C>>;

type AsProp<C extends React.ElementType> = {
  /**
   * An override of the default HTML tag.
   * Can also be another React component.
   */
  as?: C;
};

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };

interface Props {
  children: React.ReactNode;
  icon?: typeof X;
  color?: keyof typeof buttonColors;
}

type DialogButtonProps<C extends React.ElementType = "button"> =
  PolymorphicComponentPropsWithRef<C, Props>;

type DialogButtonComponent = <C extends React.ElementType = "button">(
  props: DialogButtonProps<C>
) => React.ReactElement | null;

export const DialogButton: DialogButtonComponent = forwardRef(
  function PolymorphicDialogButton<T extends React.ElementType = "button">(
    {
      children,
      icon: Icon,
      color = "neutral",
      as,
      ...props
    }: DialogButtonProps<T>,
    ref?: PolymorphicRef<T>
  ) {
    const Component = as || "button";
    return (
      <Component
        ref={ref}
        className={`rounded pl-2 pr-3 py-[10px] focus:ring-2 font-bold flex items-center gap-2 focus:shadow-none ${buttonColors[color]}`}
        {...props}
      >
        {Icon ? <Icon size={20} /> : null}
        <span className="translate-y-[-1px]">{children}</span>
      </Component>
    );
  }
);
