import React from 'react';

export interface AccessFormProps
  extends React.ComponentPropsWithoutRef<'form'> {
  title: string;
  children: React.ReactNode;
}

export function AccessForm({ title, children, ...props }: AccessFormProps) {
  return (
    <form className="w-full max-w-sm bg-white shadow-md p-6" {...props}>
      <h1 className="text-lg text-center mb-4">{title}</h1>

      {children}
    </form>
  );
}
