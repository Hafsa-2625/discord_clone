import { User } from 'lucide-react';

interface ProfilePictureProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
};

export default function ProfilePicture({ src, alt, size = 'md', className = '' }: ProfilePictureProps) {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  return (
    <div className={`${sizeClass} bg-gradient-to-br from-[#5865f2] to-[#7289da] rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar on image load error
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <User size={iconSize} className="text-white" />
      )}
      {src && (
        <User size={iconSize} className="text-white hidden" />
      )}
    </div>
  );
}
