import { motion } from 'framer-motion';

const Skeleton = ({ width, height, borderRadius = '0.75rem', style }) => {
  return (
    <motion.div
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        background: [
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.1)',
          'rgba(255, 255, 255, 0.05)'
        ]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius,
        ...style
      }}
    />
  );
};

export default Skeleton;
