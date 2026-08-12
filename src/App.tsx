import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Memory = {
  id: number;
  src: string;
  caption: string;
  rotation: string;
};

// Replace each empty src with your uploaded image path, for example: /photos/sneha-1.jpg
const memories: Memory[] = [
  { id: 1, src: "/image/1.jpg", caption: "A moment I still remember.", rotation: "-rotate-3" },
  { id: 2, src: "/image/2.jpg", caption: "I wish I could go back to this day.", rotation: "rotate-2" },
  { id: 3, src: "/image/3.jpg", caption: "One of my favorite memories.", rotation: "-rotate-1" },
  { id: 4, src: "/image/4.jpg", caption: "I miss these moments.", rotation: "rotate-3" },
  { id: 5, src: "/image/5.jpg", caption: "A moment I still remember.", rotation: "rotate-1" },
  { id: 6, src: "/image/6.jpg", caption: "I wish I could go back to this day.", rotation: "-rotate-2" },
  { id: 7, src: "/image/7.jpg", caption: "One of my favorite memories.", rotation: "rotate-2" },
  { id: 8, src: "/image/1.jpg", caption: "I miss these moments.", rotation: "-rotate-3" },
];

const confessionLines = [
  "I miss every moment I spent with you.",
  "I miss the little things, the conversations, the memories, and all those moments that became so special to me.",
  "I feel incredibly lucky that you came into my life.",
  "No matter how much time passes, those memories will always mean something to me.",
];

const floatingHearts = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 17) % 100}%`,
  delay: `${(index % 7) * 0.8}s`,
  duration: `${9 + (index % 6)}s`,
  size: `${14 + (index % 5) * 5}px`,
}));

const particles = Array.from({ length: 45 }, (_, index) => ({
  id: index,
  left: `${(index * 23) % 100}%`,
  top: `${(index * 31) % 100}%`,
  delay: `${(index % 10) * 0.45}s`,
  opacity: 0.18 + (index % 5) * 0.08,
}));

function App() {
  const galleryRef = useRef<HTMLElement | null>(null);
  const questionRef = useRef<HTMLElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);

  const [lightboxMemory, setLightboxMemory] = useState<Memory | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [yesOffset, setYesOffset] = useState({ x: 0, y: 0 });
  const [yesCaught, setYesCaught] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = lightboxMemory ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxMemory]);

  useEffect(() => {
    return () => stopMusic();
  }, []);

  const scrollToGallery = () => galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToQuestion = () => questionRef.current?.scrollIntoView({ behavior: "smooth" });

  const startMusic = () => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 1.3);
    gain.connect(context.destination);

    const notes = [261.63, 329.63, 392, 493.88];
    const oscillators = notes.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency / 2;
      noteGain.gain.value = 0.11;
      oscillator.connect(noteGain).connect(gain);
      oscillator.start();
      return oscillator;
    });

    audioContextRef.current = context;
    gainRef.current = gain;
    oscillatorsRef.current = oscillators;
    setMusicOn(true);
  };

  const stopMusic = () => {
    const context = audioContextRef.current;
    const gain = gainRef.current;

    if (context && gain) {
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.25);
      window.setTimeout(() => {
        oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
        context.close();
      }, 450);
    }

    audioContextRef.current = null;
    gainRef.current = null;
    oscillatorsRef.current = [];
    setMusicOn(false);
  };

  const toggleMusic = () => {
    if (musicOn) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  const handleYesEscape = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = yesButtonRef.current;
    if (!button || window.matchMedia("(pointer: coarse)").matches) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

    if (distance < 125) {
      const directionX = event.clientX > centerX ? -1 : 1;
      const directionY = event.clientY > centerY ? -1 : 1;
      setYesOffset({
        x: directionX * (56 + Math.random() * 62),
        y: directionY * (22 + Math.random() * 34),
      });
    }
  };

  const revealMessage = () => {
    setMessageOpen(true);
    window.setTimeout(scrollToQuestion, 120);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#160711] text-rose-50 selection:bg-rose-300 selection:text-[#4a0b28]">
      <RomanticBackdrop />

      <button
        onClick={toggleMusic}
        className="fixed right-4 top-4 z-40 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-2xl shadow-rose-950/30 backdrop-blur-md transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-rose-200"
        aria-pressed={musicOn}
      >
        {musicOn ? "Pause music" : "Soft music"} ♫
      </button>

      <section className="relative grid min-h-screen place-items-center px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,167,198,0.28),transparent_34%),linear-gradient(135deg,rgba(91,12,45,0.82),rgba(31,8,34,0.82)_48%,rgba(95,15,34,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#160711]" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative z-10 mx-auto max-w-4xl"
        >
          <motion.p
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1.1 }}
            className="font-serif text-6xl font-semibold tracking-tight text-white drop-shadow-[0_0_32px_rgba(255,129,172,0.45)] sm:text-8xl lg:text-9xl"
          >
            Sneha ❤️
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9 }}
            className="mx-auto mt-8 max-w-2xl text-balance text-2xl font-light leading-relaxed text-rose-100/90 sm:text-3xl"
          >
            I made this little place for you… because I miss the moments we spent together.
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.75 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToGallery}
            className="mt-12 rounded-full bg-gradient-to-r from-rose-200 via-pink-200 to-fuchsia-200 px-8 py-4 text-base font-semibold text-[#4a0b28] shadow-[0_0_45px_rgba(255,140,185,0.42)] transition hover:shadow-[0_0_65px_rgba(255,160,198,0.58)] focus:outline-none focus:ring-2 focus:ring-rose-100 focus:ring-offset-4 focus:ring-offset-[#3b102a]"
          >
            Open my heart ❤️
          </motion.button>
        </motion.div>
      </section>

      <section ref={galleryRef} className="relative px-5 py-24 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.45em] text-rose-200/65">our little archive</p>
          <h2 className="mt-4 font-serif text-4xl text-white sm:text-6xl">I miss those days I spent with you.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-rose-100/72">
            These spaces are waiting for your photos. Each one is a quiet place for a memory that still feels close.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {memories.map((memory, index) => (
            <motion.button
              key={memory.id}
              type="button"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: (index % 4) * 0.08 }}
              whileHover={{ y: -10, scale: 1.025, rotate: 0 }}
              onClick={() => setLightboxMemory(memory)}
              className={`group ${memory.rotation} rounded-[1.7rem] bg-rose-50 p-3 pb-6 text-left text-[#4e1732] shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-500 hover:shadow-[0_30px_90px_rgba(255,111,164,0.24)] focus:outline-none focus:ring-2 focus:ring-rose-100 focus:ring-offset-4 focus:ring-offset-[#160711]`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-gradient-to-br from-rose-200 via-fuchsia-200 to-purple-300">
                {memory.src ? (
                  <img
                    src={memory.src}
                    alt={`Sneha memory ${memory.id}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center px-6 text-center">
                    <div>
                      <p className="font-serif text-4xl text-white drop-shadow-lg">Photo {memory.id}</p>
                      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
                        placeholder
                      </p>
                      <p className="mt-4 text-sm text-white/80">Upload your photo and set its src in App.tsx</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#351024]/25 via-transparent to-white/10 opacity-70" />
              </div>
              <p className="mt-5 px-2 font-serif text-xl leading-7">{memory.caption}</p>
            </motion.button>
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={scrollToQuestion}
            className="rounded-full border border-rose-100/25 bg-white/8 px-6 py-3 text-sm font-semibold text-rose-50 backdrop-blur-md transition hover:bg-white/14 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            Keep reading
          </button>
        </div>
      </section>

      <section
        ref={questionRef}
        onMouseMove={handleYesEscape}
        className="relative grid min-h-screen place-items-center px-5 py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(190,24,93,0.22),transparent_42%)]" />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85 }}
          className="relative z-10 mx-auto w-full max-w-5xl text-center"
        >
          <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-white/14 bg-white/[0.075] px-6 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:px-12">
            <h2 className="font-serif text-4xl text-white sm:text-6xl">Sneha, can I tell you something?</h2>
            <p className="mt-5 text-xl text-rose-100/78 sm:text-2xl">Do you know how much you mean to me?</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <motion.button
                ref={yesButtonRef}
                type="button"
                animate={{ x: yesOffset.x, y: yesOffset.y }}
                transition={{ type: "spring", stiffness: 160, damping: 15 }}
                onClick={() => setYesCaught(true)}
                className="rounded-full bg-white px-8 py-4 font-bold text-[#74133f] shadow-[0_14px_38px_rgba(255,182,207,0.25)] transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 focus:ring-offset-[#47112d]"
              >
                YES ❤️
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={revealMessage}
                className="rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-8 py-4 font-bold text-white shadow-[0_16px_45px_rgba(236,72,153,0.34)] transition focus:outline-none focus:ring-2 focus:ring-rose-100 focus:ring-offset-4 focus:ring-offset-[#47112d]"
              >
                WHAT? 👀
              </motion.button>
            </div>
            <AnimatePresence>
              {yesCaught && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 text-sm text-rose-100/70"
                >
                  You caught it. My heart was yours anyway.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {messageOpen && (
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mx-auto mt-10 max-w-4xl rounded-[2.5rem] border border-rose-100/18 bg-[#240b1a]/65 px-6 py-10 text-left shadow-[0_30px_110px_rgba(255,60,130,0.16)] backdrop-blur-xl sm:px-12"
              >
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75 }}
                  className="text-center font-serif text-4xl text-white sm:text-6xl"
                >
                  I love you very much, Sneha. ❤️
                </motion.p>

                <div className="mt-10 space-y-6 text-lg leading-8 text-rose-50/82 sm:text-xl sm:leading-9">
                  {confessionLines.map((line, index) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 + index * 0.55, duration: 0.7 }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.25, duration: 0.7 }}
                  className="mt-10 text-center text-xl text-rose-100"
                >
                  And I want you to know something…
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 4.05, duration: 0.85 }}
                  className="mx-auto mt-8 max-w-3xl text-center font-serif text-3xl leading-tight text-white sm:text-5xl"
                >
                  If it isn&apos;t you, I don&apos;t want to marry anyone else.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.75, duration: 0.85 }}
                  className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-rose-50/82 sm:text-xl"
                >
                  I swear with all my heart, if life doesn&apos;t bring us together, I would rather stay alone than pretend
                  that someone else could replace you.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5.55, duration: 0.85 }}
                  className="mx-auto mt-10 max-w-3xl text-center text-lg leading-8 text-rose-50/82 sm:text-xl"
                >
                  And if someday I adopt a daughter, I already know what I&apos;d want to name her…
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: [0.92, 1.08, 1] }}
                  transition={{ delay: 6.25, duration: 1.1 }}
                  className="mt-6 text-center font-serif text-6xl font-semibold text-white drop-shadow-[0_0_35px_rgba(255,123,178,0.55)] sm:text-8xl"
                >
                  Sneha ❤️
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 7.0, duration: 0.85 }}
                  className="mx-auto mt-7 max-w-2xl text-center text-xl leading-8 text-rose-100"
                >
                  Because your name will always have a special place in my heart.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="relative grid min-h-screen place-items-center px-5 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,112,166,0.24),transparent_34%),linear-gradient(180deg,transparent,rgba(74,10,36,0.72))]" />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <h2 className="font-serif text-4xl leading-tight text-white sm:text-6xl">
            Thank you for being a part of my life, Sneha.
          </h2>
          <p className="mx-auto mt-8 max-w-xl whitespace-pre-line text-2xl leading-10 text-rose-100/82">
            {"Some memories fade with time.\nSome people don't."}
          </p>
          <div className="mx-auto mt-12 grid h-32 w-32 place-items-center rounded-full bg-rose-300/10 shadow-[0_0_80px_rgba(255,90,150,0.36)]">
            <div className="heart-pulse text-7xl">❤️</div>
          </div>
          <button
            onClick={scrollToGallery}
            className="mt-12 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            Replay our memories ✨
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {lightboxMemory && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#120711]/90 p-5 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/16 bg-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                <div className="relative aspect-[4/5] max-h-[78vh] sm:aspect-video">
                  {lightboxMemory.src ? (
                    <img
                      src={lightboxMemory.src}
                      alt={`Sneha memory ${lightboxMemory.id}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-rose-300 via-fuchsia-300 to-purple-400 px-8 text-center">
                      <div>
                        <p className="font-serif text-6xl text-white">Photo {lightboxMemory.id}</p>
                        <p className="mt-4 text-white/85">Replace this placeholder with your own photo.</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-7">
                  <p className="font-serif text-xl text-white">{lightboxMemory.caption}</p>
                  <button
                    onClick={() => setLightboxMemory(null)}
                    className="rounded-full bg-white/12 px-4 py-2 text-sm text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function RomanticBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(168,85,247,0.15),transparent_26%),radial-gradient(circle_at_50%_88%,rgba(190,24,93,0.16),transparent_32%)]" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle absolute h-1 w-1 rounded-full bg-rose-100"
          style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, opacity: particle.opacity }}
        />
      ))}
      {floatingHearts.map((heart) => (
        <span
          key={heart.id}
          className="floating-heart absolute bottom-[-10vh] text-rose-200/30 blur-[0.2px]"
          style={{ left: heart.left, animationDelay: heart.delay, animationDuration: heart.duration, fontSize: heart.size }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

export default App;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
