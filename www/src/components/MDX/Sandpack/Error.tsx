import * as React from 'react';

interface ErrorType {
  title?: string;
  message: string;
  column?: number;
  line?: number;
  path?: string;
}

export function Error({ error }: { error: ErrorType }) {
  const { message, title } = error;

  return (
    <div
      className={
        'bg-white border-2 border-red-40 rounded-lg p-6'
      }>
      <h2 className="text-red-40 text-xl mb-4">
        {title || 'Error'}
      </h2>
      <pre className="text-secondary whitespace-pre-wrap break-words">
        {message}
      </pre>
    </div>
  );
}
