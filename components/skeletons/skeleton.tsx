import { motion } from "framer-motion";

export function Skeleton({
  className = "",
  width = "w-full",
  height = "h-4",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <motion.div
      className={`${width} ${height} bg-muted rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

export function SkeletonProject() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card p-0 space-y-4">
      {/* Image placeholder */}
      <Skeleton width="w-full" height="h-48" className="rounded-none" />

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <Skeleton width="w-3/4" height="h-6" />

        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton width="w-full" height="h-4" />
          <Skeleton width="w-full" height="h-4" />
          <Skeleton width="w-2/3" height="h-4" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="w-16" height="h-6" />
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3 pt-2">
          <Skeleton width="w-24" height="h-4" />
          <Skeleton width="w-20" height="h-4" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonExperience() {
  return (
    <div className="border-l-2 border-primary/30 pl-8 py-4 space-y-4">
      {/* Title row */}
      <div className="space-y-2">
        <Skeleton width="w-1/2" height="h-5" />
        <Skeleton width="w-1/3" height="h-4" />
      </div>

      {/* Date */}
      <Skeleton width="w-1/4" height="h-3" />

      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-3/4" height="h-4" />
      </div>
    </div>
  );
}

export function SkeletonSkill() {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <Skeleton width="w-full" height="h-6" />
    </div>
  );
}

export function SkeletonBlog() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Image placeholder */}
      <Skeleton width="w-full" height="h-40" className="rounded-none" />

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Date */}
        <Skeleton width="w-1/4" height="h-3" />

        {/* Title */}
        <Skeleton width="w-3/4" height="h-5" />

        {/* Excerpt lines */}
        <div className="space-y-2 pt-2">
          <Skeleton width="w-full" height="h-4" />
          <Skeleton width="w-full" height="h-4" />
          <Skeleton width="w-1/2" height="h-4" />
        </div>

        {/* Link */}
        <Skeleton width="w-1/3" height="h-4" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full bg-primary/10 border-4 border-primary/20 overflow-hidden">
      <Skeleton width="w-full" height="h-full" className="rounded-full" />
    </div>
  );
}
