const buttonColors = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700',
  secondary: 'bg-blue-600 text-white hover:bg-blue-700',
  white: 'bg-white text-black hover:bg-gray-200',
} as const;

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  submit?: boolean;
  fullWidth?: boolean;
  color?: keyof typeof buttonColors;
}

export function Button({ submit, fullWidth, color = 'primary', ...props }: ButtonProps) {
  const bgColor = buttonColors[color], width = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={`${width} inline-block px-8 py-3 uppercase ${bgColor} font-bold transition-colors`}
      {...props}
    />
  );
}
