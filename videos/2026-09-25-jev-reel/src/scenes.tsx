import React from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Coins,
  Eye,
  EyeOff,
  GitBranch,
  Layers,
  ListChecks,
  MessageSquare,
  MousePointerClick,
  PenLine,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Split,
  Trash2,
  TrendingUp,
  X,
  Zap,
  Bot,
  Plug,
  Mic,
  AudioLines,
} from "lucide-react";
import { C, LAYOUT, SAFE, lerp, mono, pop, prog, sans, serif, serifItalic, typed } from "./theme";
import { Badge, Card, Caret, IconTile, Pop, Scene } from "./ui";
import { ClaudeLogo, GeminiLogo, JevLogo, JevMark, OpenAILogo } from "./Logos";

/* Panel = upper area while the camera is a card (y 0..1000).
   Top  = strip above the face while the camera is full-screen (y 110..600). */
const Panel: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = SAFE.top }) => (
  <div
    style={{
      position: "absolute",
      left: 90,
      right: 90,
      top,
      height: LAYOUT.panelBottom - top,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 24,
    }}
  >
    {children}
  </div>
);

const Top: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.side,
      right: SAFE.side,
      top: SAFE.top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 22,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({
  children,
  size = 76,
  style,
}) => (
  <div
    style={{
      fontFamily: serif,
      fontWeight: 400,
      fontSize: size,
      color: C.ink,
      letterSpacing: -2,
      lineHeight: 1.05,
      ...style,
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number }> = ({
  children,
  size = 44,
  color = C.ink,
  weight = 500,
}) => <div style={{ fontFamily: sans, fontSize: size, color, fontWeight: weight, letterSpacing: -0.6 }}>{children}</div>;

/** Editorial strikethrough: a thin rule sweeps across each line while the text recedes. */
const Struck: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => (
  <span
    style={{
      color: p > 0 ? `rgba(20,20,19,${lerp(1, 0.38, p)})` : undefined,
      backgroundImage: `linear-gradient(${C.ink}, ${C.ink})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 56%",
      backgroundSize: `${p * 100}% 3px`,
      WebkitBoxDecorationBreak: "clone",
      boxDecorationBreak: "clone",
    }}
  >
    {children}
  </span>
);

/* 1 · Hook */
const Hook = () => (
  <Scene start={0.05} end={3.2}>
    {(t) => (
      <Top>
        <Card style={{ padding: "26px 36px", display: "flex", alignItems: "center", gap: 22 }}>
          <IconTile icon={Sparkles} bg={C.jevPinkBg} color={C.accent} size={70} />
          <Label size={46}>Nueva inteligencia artificial</Label>
        </Card>
        <Pop t={t} at={1.2} from="scale">
          <Badge bg={C.amberBg} color={C.amber} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 34 }}>
            <TrendingUp size={34} /> Se puso de moda
          </Badge>
        </Pop>
      </Top>
    )}
  </Scene>
);

/* 2 · Hero "Jev" */
const Hero = () => (
  <Scene start={3.3} end={6.05}>
    {(t) => {
      const s = pop(t, 3.35, { damping: 11, stiffness: 120 });
      return (
        <Panel>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 520,
                height: 520,
                borderRadius: 260,
                background: `radial-gradient(circle, ${C.jevPink}55 0%, ${C.jevPink}00 68%)`,
                transform: `translate(-50%, -50%) scale(${lerp(0.4, 1, s)})`,
              }}
            />
            <div style={{ transform: `scale(${lerp(0.7, 1, s)})`, opacity: Math.min(1, s * 1.5), filter: `blur(${(1 - s) * 10}px)` }}>
              <JevLogo size={210} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
            <Pop t={t} at={3.8} from="scale">
              <Badge style={{ fontSize: 34, display: "flex", gap: 12, alignItems: "center" }}>
                by <JevMark size={32} /> TypeSafe AI
              </Badge>
            </Pop>
            <Pop t={t} at={4.0} from="scale">
              <Badge bg={C.jevPinkBg} color={C.accent} style={{ fontSize: 34, display: "flex", gap: 10, alignItems: "center" }}>
                <Sparkles size={32} /> Mágica
              </Badge>
            </Pop>
          </div>
        </Panel>
      );
    }}
  </Scene>
);

/* Prompt box styled after the reference composer */
const Composer: React.FC<{ t: number; text: string; placeholder: string; struck?: number; sendAt?: number }> = ({
  t,
  text,
  placeholder,
  struck = 0,
  sendAt = 999,
}) => {
  const send = pop(t, sendAt, { damping: 9, stiffness: 260 });
  return (
    <Card style={{ padding: "40px 44px 32px", borderRadius: 44 }}>
      <div style={{ fontFamily: sans, fontSize: 46, color: text ? C.ink : C.faint, minHeight: 112, lineHeight: 1.2, position: "relative" }}>
        {text ? <Struck p={struck}>{text}</Struck> : placeholder}
        {text && struck === 0 && <Caret t={t} h={50} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 26 }}>
        <Plus size={48} color={C.ink} strokeWidth={1.6} />
        <div style={{ flex: 1 }} />
        <Mic size={42} color={C.ink} strokeWidth={1.6} style={{ marginRight: 34 }} />
        {sendAt < 999 ? (
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 + 0.18 * Math.sin(send * Math.PI)})`,
            }}
          >
            <Send size={38} color="#fff" />
          </div>
        ) : (
          <>
            <AudioLines size={42} color={C.ink} strokeWidth={1.6} />
            <ChevronDown size={34} color={C.muted} style={{ marginLeft: 14 }} />
          </>
        )}
      </div>
    </Card>
  );
};

/* 3 · "No escribe nada" */
const NoWrite = () => (
  <Scene start={6.1} end={10.05}>
    {(t) => {
      const strike = pop(t, 7.1, { damping: 26, stiffness: 90 });
      return (
        <Panel>
          <Title size={64} style={{ textAlign: "center" }}>
            Lo <span style={{ fontFamily: serifItalic, color: C.accent }}>paradójico</span>
          </Title>
          <Composer t={t} placeholder="¿En qué te ayudo hoy?" text={typed("Escríbeme un texto largo sobre…", t, 6.3, 34)} struck={strike} />
          <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
            <Pop t={t} at={7.5} from="scale">
              <Badge bg={C.jevInk} color="#fff" style={{ fontSize: 38, display: "flex", gap: 12, alignItems: "center" }}>
                <JevMark size={34} color="#fff" /> No escribe nada
              </Badge>
            </Pop>
            <Pop t={t} at={8.9} from="scale">
              <Badge bg={C.greenBg} color={C.green} style={{ fontSize: 38, display: "flex", gap: 10, alignItems: "center" }}>
                <Check size={36} /> Muy útil
              </Badge>
            </Pop>
          </div>
        </Panel>
      );
    }}
  </Scene>
);

/* 4 · "¿Qué es lo que hace?" */
const Decides = () => (
  <Scene start={10.15} end={13.15}>
    {(t) => (
      <Top>
        <Title size={72}>¿Qué hace?</Title>
        <div style={{ display: "flex", gap: 22 }}>
          <Pop t={t} at={11.95} from="scale">
            <Card style={{ padding: "22px 30px", display: "flex", gap: 20, alignItems: "center" }}>
              <IconTile icon={MousePointerClick} bg={C.blueBg} color={C.blue} size={76} />
              <Label>Elige</Label>
            </Card>
          </Pop>
          <Pop t={t} at={12.4} from="scale">
            <Card style={{ padding: "22px 30px", display: "flex", gap: 20, alignItems: "center" }}>
              <IconTile icon={GitBranch} bg={C.violetBg} color={C.violet} size={76} />
              <Label>Toma decisiones</Label>
            </Card>
          </Pop>
        </div>
      </Top>
    )}
  </Scene>
);

/* 5 · Other assistants write long answers */
const MODELS = [
  { name: "ChatGPT", at: 14.15, Logo: OpenAILogo },
  { name: "Claude", at: 14.62, Logo: ClaudeLogo },
  { name: "Gemini", at: 14.97, Logo: GeminiLogo },
];
const LONG_ANSWER =
  "¡Claro! Aquí tienes una respuesta completa. En este caso sería de esta manera: primero, analizamos el contexto; luego…";

const Models = () => (
  <Scene start={13.25} end={21.4}>
    {(t) => (
      <Panel>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          {MODELS.map((m) => (
            <Pop key={m.name} t={t} at={m.at} from="scale">
              <Card style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 16, borderRadius: 30 }}>
                <m.Logo size={44} />
                <Label size={40}>{m.name}</Label>
              </Card>
            </Pop>
          ))}
        </div>
        <Pop t={t} at={16.6}>
          <Card style={{ padding: "34px 40px", borderRadius: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <IconTile icon={PenLine} bg={C.chip} color={C.muted} size={60} />
              <Label size={34} color={C.muted}>
                Te escriben una respuesta…
              </Label>
            </div>
            <div style={{ fontFamily: serif, fontSize: 44, lineHeight: 1.3, color: C.ink, minHeight: 230 }}>
              {typed(LONG_ANSWER, t, 17.2, 26)}
              <Caret t={t} h={44} />
            </div>
          </Card>
        </Pop>
      </Panel>
    )}
  </Scene>
);

/* 6 · Three ways — dropdown modelled on the reference "Output" menu */
const FORMS = [
  { title: "Elige", desc: "entre una u otra", icon: Split, bg: C.blueBg, color: C.blue, badge: "A / B", at: 25.05 },
  { title: "Te da a elegir", desc: "tú pones las condiciones", icon: ListChecks, bg: C.amberBg, color: C.amber, badge: "Opciones", at: 27.95 },
  { title: "Clasifica", desc: "según niveles que colocas", icon: Layers, bg: C.violetBg, color: C.violet, badge: "Niveles", at: 32.35 },
];

const FormDemo: React.FC<{ i: number; t: number; at: number; color: string }> = ({ i, t, at, color }) => {
  if (i === 0) {
    const pick = pop(t, at + 1.4);
    return (
      <div style={{ display: "flex", gap: 10 }}>
        {["A", "B"].map((k, j) => (
          <div
            key={k}
            style={{
              fontFamily: mono,
              fontSize: 30,
              width: 58,
              height: 52,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: j === 1 && pick > 0.5 ? color : C.chip,
              color: j === 1 && pick > 0.5 ? "#fff" : C.muted,
              transform: `scale(${j === 1 ? 1 + 0.12 * Math.sin(pick * Math.PI) : 1})`,
            }}
          >
            {k}
          </div>
        ))}
      </div>
    );
  }
  if (i === 1) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3].map((k) => {
          const on = pop(t, at + 0.9 + k * 0.35);
          return (
            <div
              key={k}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: k === 2 && t > at + 2.6 ? color : C.chip,
                transform: `scale(${lerp(0.4, 1, on)})`,
              }}
            />
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 56 }}>
      {[0.4, 0.7, 1].map((h, k) => {
        const g = pop(t, at + 0.6 + k * 0.25);
        return <div key={k} style={{ width: 22, height: 56 * h * g, borderRadius: 6, background: k === 2 ? color : C.violetBg }} />;
      })}
    </div>
  );
};

const Forms = () => (
  <Scene start={21.45} end={35.05}>
    {(t) => {
      const active = FORMS.reduce((acc, f, i) => (t >= f.at ? i : acc), -1);
      return (
        <Panel top={SAFE.top - 20}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Title size={70}>
              <span style={{ fontFamily: serifItalic, color: C.accent }}>3</span> formas de responder
            </Title>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Pop t={t} at={22.6} from="scale">
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.chip, borderRadius: 18, padding: "12px 24px", fontFamily: sans, fontSize: 36, color: "#55534C" }}>
                Output <ChevronDown size={30} />
              </div>
            </Pop>
            <Pop t={t} at={24.55} from="scale">
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: mono, fontSize: 30, color: C.ink, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: "10px 20px" }}>
                <Code2 size={30} color={C.accent} /> {'{ "decision": "B" }'}
              </div>
            </Pop>
          </div>
          <Pop t={t} at={23.1}>
            <Card style={{ padding: "22px 22px", display: "flex", flexDirection: "column", gap: 6 }}>
              {FORMS.map((f, i) => {
                const p = pop(t, f.at);
                const on = i === active;
                return (
                  <div
                    key={f.title}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 26,
                      padding: "16px 22px",
                      borderRadius: 26,
                      background: on ? "#F5F3EC" : "transparent",
                      opacity: lerp(0.25, 1, p),
                      transform: `translateX(${(1 - p) * -30}px)`,
                    }}
                  >
                    <IconTile icon={f.icon} bg={f.bg} color={f.color} size={88} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Label size={46}>{f.title}</Label>
                        <Badge style={{ fontSize: 26, padding: "6px 16px" }}>{f.badge}</Badge>
                      </div>
                      <Label size={32} color={C.muted} weight={400}>
                        {f.desc}
                      </Label>
                    </div>
                    {p > 0.05 && <FormDemo i={i} t={t} at={f.at} color={f.color} />}
                  </div>
                );
              })}
            </Card>
          </Pop>
        </Panel>
      );
    }}
  </Scene>
);

/* 7 · Why it matters */
const Matters = () => (
  <Scene start={35.15} end={38.6}>
    {(t) => (
      <Top>
        <Pop t={t} at={35.3}>
          <Label size={40} color={C.muted}>
            ¿Por qué importa?
          </Label>
        </Pop>
        <Pop t={t} at={36.4} from="scale">
          <Card style={{ padding: "26px 36px", display: "flex", alignItems: "center", gap: 22 }}>
            <IconTile icon={Sparkles} bg={C.amberBg} color={C.amber} size={80} />
            <Label size={48}>Apps con IA</Label>
          </Card>
        </Pop>
      </Top>
    )}
  </Scene>
);

const StepLines = ({ t, at }: { t: number; at: number }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
    {[0.95, 0.8, 0.9, 0.55].map((w, i) => (
      <div key={i} style={{ height: 18, borderRadius: 9, background: C.chip, width: `${w * 100 * prog(t, at + i * 0.4, at + i * 0.4 + 0.5)}%` }} />
    ))}
  </div>
);

/* 8 · No LLM writing step by step */
const NoSteps = () => (
  <Scene start={38.7} end={43.85}>
    {(t) => {
      const cross = prog(t, 40.45, 40.85);
      return (
        <Top>
          <Card style={{ padding: "28px 36px", width: 820, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <IconTile icon={PenLine} bg={C.chip} color={C.muted} size={68} />
              <Label size={40}>
                LLM escribiendo <span style={{ fontFamily: serifItalic, color: C.accent }}>paso a paso</span>…
              </Label>
            </div>
            <StepLines t={t} at={39.0} />
            <div style={{ position: "absolute", inset: 0, opacity: cross }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "rgba(250,249,245,0.55)" }} />
            </div>
          </Card>
          <Pop t={t} at={40.6} from="scale">
            <Badge bg={C.redBg} color={C.red} style={{ fontSize: 36, display: "flex", alignItems: "center", gap: 10 }}>
              <X size={34} /> No siempre hace falta
            </Badge>
          </Pop>
        </Top>
      );
    }}
  </Scene>
);

/* 9 · Decisions happen behind the scenes */
const Behind = () => (
  <Scene start={43.95} end={47.6}>
    {(t) => {
      const slide = pop(t, 44.3, { damping: 16, stiffness: 120 });
      return (
        <Top>
          <div style={{ position: "relative", width: 820, height: 300 }}>
            <Card
              style={{
                position: "absolute",
                left: 60,
                right: -10,
                top: lerp(90, 0, slide),
                height: 170,
                padding: "0 34px",
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: "#F4F2EB",
                transform: `scale(${lerp(1, 0.94, slide)})`,
              }}
            >
              <IconTile icon={EyeOff} bg={C.violetBg} color={C.violet} size={64} />
              <Label size={36} color="#55534C">
                Jev decide por detrás
              </Label>
            </Card>
            <Card
              style={{
                position: "absolute",
                left: 0,
                right: 70,
                top: 110,
                height: 170,
                padding: "0 34px",
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <IconTile icon={Eye} bg={C.blueBg} color={C.blue} size={64} />
              <Label size={38}>Lo que ve el usuario</Label>
            </Card>
          </div>
          <Pop t={t} at={46.55} from="scale">
            <Badge bg={C.violetBg} color={C.violet} style={{ fontSize: 34 }}>
              No se nota
            </Badge>
          </Pop>
        </Top>
      );
    }}
  </Scene>
);

/* 10 · Chat moderation example */
const Bubble: React.FC<{ who: string; text: React.ReactNode; tone?: "bad" | "llm"; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  who,
  text,
  tone,
  style,
  children,
}) => (
  <div
    style={{
      position: "relative",
      padding: "18px 26px",
      borderRadius: 26,
      background: tone === "bad" ? C.redBg : tone === "llm" ? "#F4F2EB" : C.chip,
      border: `2px solid ${tone === "bad" ? "rgba(196,85,61,0.35)" : "transparent"}`,
      ...style,
    }}
  >
    <div style={{ fontFamily: sans, fontSize: 26, fontWeight: 600, color: tone === "bad" ? C.red : C.muted, marginBottom: 4 }}>{who}</div>
    <div style={{ fontFamily: sans, fontSize: 36, color: C.ink, lineHeight: 1.25 }}>{text}</div>
    {children}
  </div>
);

const Moderation = () => (
  <Scene start={47.75} end={57.35}>
    {(t) => {
      const llmCross = pop(t, 52.5, { damping: 26, stiffness: 90 });
      const detect = pop(t, 53.5);
      const remove = pop(t, 55.25, { damping: 20, stiffness: 140 });
      const scan = prog(t, 53.0, 53.6);
      return (
        <Panel top={SAFE.top - 20}>
          <Card style={{ padding: "30px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
              <IconTile icon={ShieldCheck} bg={C.greenBg} color={C.green} size={70} />
              <Label size={42}>Moderar un chat</Label>
              <div style={{ flex: 1 }} />
              <Pop t={t} at={55.8} from="scale">
                <Badge bg={C.greenBg} color={C.green} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={28} /> Listo
                </Badge>
              </Pop>
            </div>
            <Pop t={t} at={48.4}>
              <Bubble who="Ana" text="¿Hacen envíos a Lima?" />
            </Pop>
            <div
              style={{
                opacity: 1 - remove,
                height: lerp(174, 0, remove),
                marginTop: lerp(0, -18, remove),
                transform: `scale(${lerp(1, 0.9, remove)})`,
                overflow: remove > 0.02 ? "hidden" : "visible",
                paddingTop: 24,
              }}
            >
              <Pop t={t} at={49.6}>
                <Bubble who="Usuario" text="Esto es una estafa, ****" tone={detect > 0.1 ? "bad" : undefined}>
                  {scan > 0 && scan < 1 && (
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 6, background: C.accent, boxShadow: `0 0 24px ${C.accent}` }} />
                  )}
                  <div style={{ position: "absolute", right: 18, top: -22, transform: `scale(${detect})` }}>
                    <Badge bg={C.red} color="#fff" style={{ fontSize: 26, display: "flex", alignItems: "center", gap: 8 }}>
                      <Trash2 size={26} /> Jev: mala
                    </Badge>
                  </div>
                </Bubble>
              </Pop>
            </div>
            <Pop t={t} at={50.6}>
              <Bubble who="LLM" tone="llm" text={<Struck p={llmCross}>Esta respuesta es mala porque, en primer lugar…</Struck>} />
            </Pop>
          </Card>
        </Panel>
      );
    }}
  </Scene>
);

/* 11 · Best of Jev */
const STATS = [
  { label: "Alucina poco", icon: ShieldCheck, bg: C.greenBg, color: C.green, at: 60.6, fill: 0.9 },
  { label: "Rápida", icon: Zap, bg: C.amberBg, color: C.amber, at: 62.45, fill: 0.95 },
  { label: "Económica", icon: Coins, bg: C.blueBg, color: C.blue, at: 63.85, fill: 0.85 },
];

const Best = () => (
  <Scene start={57.45} end={65.1}>
    {(t) => (
      <Top>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Title size={70}>Lo mejor de</Title>
          <JevLogo size={66} gap={0.22} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {STATS.map((s) => (
            <Pop key={s.label} t={t} at={s.at} from="scale">
              <Card style={{ width: 290, padding: "26px 26px", display: "flex", flexDirection: "column", gap: 18, borderRadius: 34 }}>
                <IconTile icon={s.icon} bg={s.bg} color={s.color} size={72} />
                <Label size={38}>{s.label}</Label>
                <div style={{ height: 14, borderRadius: 7, background: C.chip, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.fill * 100 * pop(t, s.at + 0.2, { damping: 22, stiffness: 60 })}%`, background: s.color, borderRadius: 7 }} />
                </div>
              </Card>
            </Pop>
          ))}
        </div>
      </Top>
    )}
  </Scene>
);

/* 12 · Where it fits */
const USES = [
  { title: "Apps con IA", desc: "integrada vía API", icon: Plug, ok: true, at: 66.95 },
  { title: "Chat directo", desc: "no sirve tanto", icon: MessageSquare, ok: false, at: 70.45 },
  { title: "Chatbots", desc: "como pieza interna", icon: Bot, ok: true, at: 74.4 },
];

const Uses = () => (
  <Scene start={65.2} end={75.85}>
    {(t) => (
      <Panel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Title size={70}>
            ¿Para qué <span style={{ fontFamily: serifItalic, color: C.accent }}>sirve</span>?
          </Title>
          <Pop t={t} at={68.9} from="scale">
            <div style={{ fontFamily: mono, fontSize: 28, color: C.ink, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: "10px 20px", display: "flex", gap: 10, alignItems: "center" }}>
              <Code2 size={28} color={C.accent} /> POST /decide
            </div>
          </Pop>
        </div>
        <Card style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 4 }}>
          {USES.map((u, i) => {
            const p = pop(t, u.at);
            return (
              <div
                key={u.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "22px 20px",
                  borderTop: i ? `2px solid ${C.chip}` : "none",
                  opacity: lerp(0.2, u.ok ? 1 : 0.75, p),
                  transform: `translateX(${(1 - p) * -30}px)`,
                }}
              >
                <IconTile icon={u.icon} bg={u.ok ? C.greenBg : C.chip} color={u.ok ? C.green : C.muted} size={84} />
                <div style={{ flex: 1 }}>
                  <Label size={46}>{u.title}</Label>
                  <Label size={32} color={C.muted} weight={400}>
                    {u.desc}
                  </Label>
                </div>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    background: u.ok ? C.green : C.redBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${pop(t, u.at + 0.25, { damping: 9, stiffness: 260 })})`,
                  }}
                >
                  {u.ok ? <Check size={42} color="#fff" strokeWidth={3} /> : <X size={42} color={C.red} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </Card>
      </Panel>
    )}
  </Scene>
);

/* 13 · CTA */
const Cta = () => (
  <Scene start={75.95} end={80}>
    {(t) => (
      <Top>
        <div style={{ width: 900 }}>
          <Composer t={t} placeholder="Cuéntame…" text={typed("¿Ya usas Jev o piensas usarla?", t, 76.1, 24)} sendAt={77.7} />
        </div>
        <Pop t={t} at={78.45} from="scale">
          <Card style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 34px", borderRadius: 32 }}>
            <JevMark size={62} style={{ transform: `rotate(${Math.sin(t * 3) * 6}deg)` }} />
            <Title size={64}>¡Ahí nos vemos!</Title>
          </Card>
        </Pop>
      </Top>
    )}
  </Scene>
);

export const Scenes = () => (
  <>
    <Hook />
    <Hero />
    <NoWrite />
    <Decides />
    <Models />
    <Forms />
    <Matters />
    <NoSteps />
    <Behind />
    <Moderation />
    <Best />
    <Uses />
    <Cta />
  </>
);
