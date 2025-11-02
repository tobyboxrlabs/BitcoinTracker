import { useScramble } from "use-scramble";

interface ShuffleTextProps {
  text: string;
  className?: string;
  speed?: number;
  scramble?: number;
  step?: number;
}

export function ShuffleText({ 
  text, 
  className = "", 
  speed = 0.6,
  scramble = 4,
  step = 1
}: ShuffleTextProps) {
  const { ref } = useScramble({
    text,
    speed,
    tick: 1,
    step,
    scramble,
    seed: 0,
  });

  return <span ref={ref} className={className} />;
}

