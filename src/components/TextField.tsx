export interface TextFieldProps
  extends React.ComponentPropsWithoutRef<'input'> {
  id: string;
  label: string;
}

export function TextField({
  id,
  name = id,
  label,
  required = false,
  ...props
}: TextFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="text-md mb-1" htmlFor={id}>
        {label} {required && '*'}
      </label>

      <input
        className="py-2 px-4 text-md border border-solid  border-gray-400 rounded-sm"
        type="text"
        name={name}
        id={id}
        required={required}
        {...props}
      />
    </div>
  );
}
