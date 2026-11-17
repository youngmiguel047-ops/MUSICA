import { Music2 } from 'lucide-react';
import { useState } from 'react';

interface CoverImageProps {
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Affiche une pochette ou un avatar avec repli visuel élégant si l'image est absente ou échoue.
 */
export function CoverImage({ src, alt, className = '' }: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 text-zinc-500 dark:text-zinc-400 ${className}`}
        aria-label={alt}
      >
        <Music2 className="w-1/3 h-1/3 opacity-70" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}
