import React from "react";
import { Lock } from "lucide-react";

interface PremiumFeatureProps {
  isPremium: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  isPremium,
  title,
  description,
  children,
}) => {
  if (isPremium) {
    return (
      <div className="space-y-3">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="opacity-50 pointer-events-none select-none blur-[1px]">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border border-border shadow-sm">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Función Premium</span>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeature;
