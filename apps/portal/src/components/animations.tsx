import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const FadeInSection = ({ children, delay = 0, stagger = 0.1 }: { children: ReactNode; delay?: number; stagger?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, staggerChildren: stagger }}
  >
    {children}
  </motion.div>
);

export const AnimatedCard = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, ...props }: { children: ReactNode } & React.ComponentProps<typeof motion.button>) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.button>
);

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

export const AnimatedModal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  const sizeMap = { sm: "max-width: 400px", md: "max-width: 600px", lg: "max-width: 800px" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            style={sizeMap[size] as any}
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="modal-header">
                <h2 className="modal-title">{title}</h2>
                <button className="modal-close" onClick={onClose}>
                  <motion.span whileHover={{ rotate: 90 }}>×</motion.span>
                </button>
              </div>
            )}
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
};

export const AnimatedDrawer = ({ isOpen, onClose, title, children, side = "right" }: DrawerProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="drawer"
          style={{ [side]: 0 }}
          initial={{ x: side === "right" ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: side === "right" ? "100%" : "-100%" }}
          transition={{ duration: 0.3 }}
        >
          {title && (
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button className="modal-close" onClick={onClose}>
                <motion.span whileHover={{ rotate: 90 }}>×</motion.span>
              </button>
            </div>
          )}
          <div className="modal-body">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export const LoadingSpinner = ({ size = 40 }: { size?: number }) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
    <motion.div
      style={{
        width: size,
        height: size,
        border: "3px solid var(--border-light)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%"
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export const StaggerChildren = ({ children, delay = 0, stagger = 0.1 }: { children: ReactNode; delay?: number; stagger?: number }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
