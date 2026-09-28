import React from "react";
import { Building2, ChartColumn, Database, FileText, Mail, MessageCircle, Sparkles as SparkIcon, Zap } from "lucide-react";
import { Appear, Beat, Big, Bubble, ClaudeLogo, Hand, Head, Label, Pill, QuestionCard, Sparkles, Tile, cue, ease } from "./ali";
import { Rough } from "./rough";
import { C, sans, serif, SOFT } from "./theme";

const GOLD_TILE = "linear-gradient(160deg,#FFE08A,#F5A623)";
const SKY_TILE = "linear-gradient(160deg,#9FD8FF,#3B8BEB)";
const MINT_TILE = "linear-gradient(160deg,#7EE0A1,#1E8C4E)";
const PEACH_TILE = "linear-gradient(160deg,#FFB38A,#E8603C)";
const LILAC_TILE = "linear-gradient(160deg,#DCCBFF,#8E6CF0)";
const MAIL_TILE = "linear-gradient(160deg,#6FC3FF,#1F6FD1)";

/** Icon-circle colors of Ali's small boxes. */
const DOT = { blue: "#A5D8FF", yellow: "#FDD46B", mint: "#8EF0A8", lilac: "#C9B6FF" };

const center = (top: number): React.CSSProperties => ({ left: 0, right: 0, top, display: "flex", justifyContent: "center" });
const WHITE_GLOW = "0 0 0 1px rgba(0,0,0,.04), 0 0 36px rgba(255,255,255,.45), 0 10px 26px rgba(0,0,0,.26)";

/* ---------- Ali elements ---------- */
const MicrosoftLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 22 22">
    <rect width="10" height="10" fill="#F25022" />
    <rect x="12" width="10" height="10" fill="#7FBA00" />
    <rect y="12" width="10" height="10" fill="#00A4EF" />
    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
  </svg>
);

/** Small white box with a colored icon circle (Ali's list items). */
const ABox: React.FC<{ icon: React.ReactNode; dot: string; w: number; children: React.ReactNode }> = ({ icon, dot, w, children }) => (
  <div style={{ width: w, display: "flex", alignItems: "center", gap: 14, padding: "11px 20px 11px 11px", borderRadius: 26, background: C.white, color: "#111", fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: -0.4, whiteSpace: "nowrap", boxShadow: WHITE_GLOW }}>
    <div style={{ width: 58, height: 58, borderRadius: "50%", background: dot, display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "inset 0 3px 6px rgba(255,255,255,.5), 0 3px 8px rgba(0,0,0,.18)" }}>{icon}</div>
    {children}
  </div>
);

/** Big white card with an icon on top, a bold title and a gray subtitle. */
const ACard: React.FC<{ icon: React.ReactNode; title: string; sub: string }> = ({ icon, title, sub }) => (
  <div style={{ width: 400, height: 270, borderRadius: 34, background: C.white, color: "#111", textAlign: "center", padding: "30px 24px", fontFamily: sans, boxShadow: "0 0 0 1px rgba(0,0,0,.04), 0 0 40px rgba(255,255,255,.45), 0 14px 34px rgba(0,0,0,.28)" }}>
    <div style={{ display: "flex", justifyContent: "center" }}>{icon}</div>
    <div style={{ marginTop: 18, fontWeight: 700, fontSize: 38, letterSpacing: -0.8 }}>{title}</div>
    <div style={{ marginTop: 4, fontWeight: 500, fontSize: 27, color: "#6E6B73" }}>{sub}</div>
  </div>
);

const GoldChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: "6px 18px", borderRadius: 14, background: C.yellow, color: C.ink, fontFamily: sans, fontWeight: 700, fontSize: 26, boxShadow: "0 6px 16px rgba(0,0,0,.25)", whiteSpace: "nowrap" }}>{children}</div>
);

/** The one macOS window of the reel: an ERP sales dashboard whose KPIs pop and bars grow. */
const MacWindow: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const bars = [0.38, 0.55, 0.47, 0.68, 0.6, 0.8, 1];
  const kpis: Array<[string, string]> = [["Ventas", "S/ 48 k"], ["Pedidos", "312"], ["Stock bajo", "7"]];
  return (
    <div style={{ width: 780, borderRadius: 26, overflow: "hidden", background: C.white, color: C.ink, fontFamily: sans, boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 0 50px rgba(255,255,255,.45), 0 18px 44px rgba(0,0,0,.32)" }}>
      <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#F4F2F6", borderBottom: "1px solid #E7E4EA" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ marginLeft: 14, fontWeight: 600, fontSize: 22, color: "#6E6B73" }}>ERP · Ventas</div>
      </div>
      <div style={{ display: "flex", gap: 14, padding: "18px 22px 6px" }}>
        {kpis.map(([k, v], i) => {
          const p = ease(t, at + 0.35 + i * 0.15, 0.4);
          return (
            <div key={k} style={{ flex: 1, background: "#F7F5F9", borderRadius: 16, padding: "10px 16px", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
              <div style={{ fontWeight: 500, fontSize: 18, color: "#8A8791" }}>{k}</div>
              <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: -0.6 }}>{v}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 150, padding: "10px 26px 20px" }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${b * 100}%`,
              borderRadius: "10px 10px 4px 4px",
              background: i === bars.length - 1 ? "linear-gradient(180deg,#FFE08A,#F5A623)" : "linear-gradient(180deg,#9FD8FF,#3B8BEB)",
              transformOrigin: "bottom",
              transform: `scaleY(${ease(t, at + 0.8 + i * 0.09, 0.5)})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------- word cues ---------- */
const T = {
  // hook
  varias: cue("varias", 1.5),
  // client request
  decian: cue("decían", 7.3),
  quiero: cue("quiero", 7.8),
  agente1: cue("agente", 8.5),
  aqui: cue("aquí", 11.8),
  // Microsoft
  entorno: cue("entorno", 14),
  microsoft: cue("microsoft", 14.3),
  sistemas: cue("sistemas", 15),
  // automation
  sin: cue("sin", 15.8),
  pero1: cue("pero", 17.4),
  una: cue("una", 18.5),
  ni: cue("ni", 19.9),
  // the problem
  problema: cue("problema", 22.9),
  vean: cue("vean", 26.6),
  si2: cue("sí", 29.1),
  // not always an agent (lowered)
  conversacional: cue("conversacional", 32.5),
  programatico: cue("programático", 34.4),
  // the 9:00 flow (lowered)
  las: cue("las", 35.7),
  nueve: cue("9", 35.9),
  lea: cue("lea", 36.6),
  extraiga: cue("extraiga", 39.2),
  pasa: cue("pasa", 40.1),
  ia: cue("inteligencia", 41.6),
  noEs: cue("no", 43.2),
  // not everything goes through a chat
  chat: cue("chat", 45.9),
  claude: cue("claude", 46.4),
  // adaptive systems
  aVeces: cue("a", 47.6),
  adapten: cue("adapten", 50.0),
  // dashboard window (lowered)
  dashboard: cue("dashboard", 52.0),
  hace: cue("hace", 53.2),
  // ending take (IMG_4385)
  crear: cue("crear", 58.2),
  rapida: cue("rápida", 59.8),
  economica: cue("económica", 60.8),
  asi: cue("así", 61.8),
  crear2: cue("crear", 63.5),
};

export const CUES = {
  transicion: [30.05, 44.65, 50.95, 56.3],
  aparicion: [T.varias, T.decian, T.entorno, T.microsoft, T.una, T.problema, T.conversacional, T.programatico, 36.45, T.lea, T.extraiga, T.pasa, T.claude, T.dashboard, T.crear, T.asi],
  tecleo: [T.quiero, T.quiero + 1.2, T.quiero + 2.4, T.quiero + 3.6],
  check: [T.si2, T.ia, T.economica],
  clic: [] as number[],
  exito: [] as number[],
  timelapse: [] as number[],
};

export const Scenes: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* 0 · Hook: quoting AI for companies */}
    <Beat t={t} start={0} end={7.0}>
      <Label t={t} at={0.08} top={262} text="Estos últimos" strong="meses" />
      {[0, 1, 2].map((i) => (
        <Appear key={i} t={t} at={T.varias + i * 0.14} style={{ left: 300 + i * 180, top: 322 }}>
          <Tile t={t} size={120} bg={[SKY_TILE, LILAC_TILE, PEACH_TILE][i]} phase={i * 1.3} tilt={[-8, 0, 8][i]}>
            <Building2 size={62} color="#fff" strokeWidth={2.3} />
          </Tile>
        </Appear>
      ))}
      <Head t={t} text="Cotizando *IA*=inteligencia en=dentro *empresas*" from={1.3} top={472} size={76} />
      <Rough t={t} at={cue("inteligencia", 4.8)} shape={{ kind: "curve", pts: [[390, 568], [540, 560], [700, 566]] }} color={C.gold} width={6} seed={3} />
    </Beat>

    {/* 1 · What the clients asked for */}
    <Beat t={t} start={T.decian - 0.1} end={13.15}>
      <Label t={t} at={T.decian - 0.1} top={262} text="Lo que me" strong="pedían:" />
      <Appear t={t} at={T.decian + 0.1} kind="up" style={{ left: 120, right: 120, top: 322 }}>
        <QuestionCard t={t} t0={T.quiero} t1={T.aqui + 0.2} size={40} text="«Quiero que un agente coja este documento, lo lleve acá y lo registre aquí»" />
      </Appear>
      <Hand t={t} at={T.agente1 + 0.2} text="el cliente" color={C.mint} size={56} x={700} y={552} rotate={-4} />
      <Rough t={t} at={T.agente1 + 0.5} shape={{ kind: "arrow", pts: [[690, 588], [640, 586], [612, 536]], head: 24 }} color={C.mint} width={5} seed={11} />
    </Beat>

    {/* 2 · Mostly a Microsoft environment */}
    <Beat t={t} start={T.entorno - 0.1} end={15.9}>
      <Appear t={t} at={T.entorno} style={center(262)}>
        <Pill size={50} pad="18px 34px">
          <MicrosoftLogo size={54} /> Microsoft
        </Pill>
      </Appear>
      {[
        [<Mail key="m" size={62} color="#fff" strokeWidth={2.4} />, MAIL_TILE, 200, 418, -8],
        [<FileText key="f" size={62} color="#fff" strokeWidth={2.4} />, MINT_TILE, 482, 400, 0],
        [<Database key="d" size={62} color="#fff" strokeWidth={2.4} />, GOLD_TILE, 764, 418, 8],
      ].map(([icon, bg, x, y, tilt], i) => (
        <Appear key={i} t={t} at={T.microsoft + i * 0.12} style={{ left: x as number, top: y as number }}>
          <Tile t={t} size={116} bg={bg as string} phase={i * 1.3} tilt={tilt as number}>
            {icon}
          </Tile>
        </Appear>
      ))}
      <Hand t={t} at={T.sistemas} text="y sistemas así" color={C.lilac} size={50} x={600} y={556} rotate={-3} />
    </Beat>

    {/* 3 · "This can be an automation" */}
    <Beat t={t} start={T.sin - 0.05} end={22.45}>
      <Appear t={t} at={T.sin} kind="fade" style={{ left: 0, right: 0, top: 262, textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontVariationSettings: SOFT, fontWeight: 640, fontSize: 56, color: C.white, opacity: 0.62, textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>Un agente de IA</div>
      </Appear>
      <Rough t={t} at={T.pero1} shape={{ kind: "curve", pts: [[330, 300], [540, 292], [752, 302]] }} color={C.peach} width={7} roughness={1} seed={21} />
      <Head t={t} text="Una *automatización*" from={T.una - 0.05} top={334} size={80} />
      <Appear t={t} at={T.una + 0.5} style={{ left: 105, top: 462 }}>
        <ABox icon={<FileText size={32} color={C.ink} strokeWidth={2.3} />} dot={DOT.blue} w={255}>documento</ABox>
      </Appear>
      <Rough t={t} at={T.una + 0.75} shape={{ kind: "arrow", pts: [[368, 502], [420, 502]], head: 18 }} color={C.white} width={5} seed={23} />
      <Appear t={t} at={T.una + 0.95} style={{ left: 430, top: 462 }}>
        <ABox icon={<Zap size={32} color={C.ink} strokeWidth={2.3} />} dot={DOT.yellow} w={225}>lo mueve</ABox>
      </Appear>
      <Rough t={t} at={T.una + 1.2} shape={{ kind: "arrow", pts: [[663, 502], [715, 502]], head: 18 }} color={C.white} width={5} seed={25} />
      <Appear t={t} at={T.una + 1.4} style={{ left: 725, top: 462 }}>
        <ABox icon={<Database size={32} color={C.ink} strokeWidth={2.3} />} dot={DOT.mint} w={250}>lo registra</ABox>
      </Appear>
      <Hand t={t} at={T.ni} text="ni siquiera necesita IA" color={C.peach} size={46} x={330} y={562} rotate={-2} />
    </Beat>

    {/* 4a · The problem: companies want AI no matter what */}
    <Beat t={t} start={T.problema - 0.1} end={26.45}>
      <Label t={t} at={T.problema - 0.1} top={262} text="El" strong="problema:" />
      <Head t={t} text="Quieren=quieran IA=quieran *sí* *o* *sí*" from={24.2} top={330} size={88} />
      <Rough t={t} at={cue("sí", 24.8) + 0.1} shape={{ kind: "curve", pts: [[250, 448], [540, 456], [830, 446]] }} color={C.gold} width={6} seed={31} />
      <Hand t={t} at={cue("integrar", 25.0)} text="integrar IA porque sí" color={C.peach} size={46} center y={478} rotate={-2} />
    </Beat>

    {/* 4b · They see AI as something that does everything… and it can */}
    <Beat t={t} start={T.vean - 0.1} end={30.1}>
      <Head t={t} text="Ven=vean la *IA* como algo que *hace*=hacer *todo*" from={T.vean - 0.05} top={290} size={74} />
      <Hand t={t} at={T.si2} text="…y sí puede" color={C.mint} size={56} x={330} y={488} rotate={-3} />
      <Rough t={t} at={T.si2 + 0.3} shape={{ kind: "curve", pts: [[650, 520], [672, 548], [720, 486]] }} color={C.mint} width={7} roughness={0.9} seed={41} dur={0.3} />
      <Sparkles t={t} at={T.si2 + 0.2} points={[[800, 480, 34], [835, 540, 22], [290, 470, 26]]} color={C.mint} />
    </Beat>

    {/* 5 · Not always an agent (camera lowered) */}
    <Beat t={t} start={30.2} end={36.3}>
      <Label t={t} at={30.25} top={262} text="Pero el" strong="detalle:" />
      <Head t={t} text="No=no todo=todos es un *agente*" from={31.1} top={316} size={72} />
      <Appear t={t} at={T.conversacional} style={{ left: 100, top: 425 }}>
        <ACard
          icon={<div style={{ width: 104, height: 104, borderRadius: "50%", background: C.lilac, display: "grid", placeItems: "center", boxShadow: "inset 0 3px 6px rgba(255,255,255,.5), 0 3px 8px rgba(0,0,0,.18)" }}><MessageCircle size={54} color={C.ink} strokeWidth={2.2} /></div>}
          title="Conversacional"
          sub="le hablas por chat"
        />
      </Appear>
      <Appear t={t} at={T.programatico} style={{ left: 580, top: 425 }}>
        <ACard icon={<Tile t={t} size={104} bg={GOLD_TILE}><Zap size={60} color="#fff" strokeWidth={2.4} /></Tile>} title="Programático" sub="corre solo, a su hora" />
      </Appear>
      <Rough t={t} at={T.programatico + 0.3} shape={{ kind: "ellipse", cx: 780, cy: 560, w: 500, h: 350 }} color={C.yellow} width={7} roughness={1.6} seed={51} dur={0.5} />
      <Hand t={t} at={T.programatico + 0.5} text="casi siempre es este" color={C.yellow} size={50} x={470} y={744} rotate={-2} />
    </Beat>

    {/* 6 · The 9:00 programmatic flow (camera lowered) */}
    <Beat t={t} start={36.35} end={44.6}>
      <Label t={t} at={36.35} top={262} text="Todos los días a las" />
      <Appear t={t} at={36.45} style={center(302)}>
        <Big size={150}>9:00</Big>
      </Appear>
      <Appear t={t} at={T.lea} style={{ left: 95, top: 520 }}>
        <ABox icon={<Mail size={32} color={C.ink} strokeWidth={2.3} />} dot={DOT.blue} w={255}>lee correos</ABox>
      </Appear>
      <Rough t={t} at={T.extraiga - 0.35} shape={{ kind: "arrow", pts: [[357, 560], [403, 560]], head: 17 }} color={C.white} width={5} seed={61} />
      <Appear t={t} at={T.extraiga} style={{ left: 410, top: 520 }}>
        <ABox icon={<FileText size={32} color={C.ink} strokeWidth={2.3} />} dot={DOT.yellow} w={270}>extrae datos</ABox>
      </Appear>
      <Rough t={t} at={T.pasa - 0.3} shape={{ kind: "arrow", pts: [[687, 560], [733, 560]], head: 17 }} color={C.white} width={5} seed={63} />
      <Appear t={t} at={T.pasa} style={{ left: 740, top: 520 }}>
        <ABox icon={<Database size={32} color={C.ink} strokeWidth={2.3} />} dot={DOT.mint} w={245}>al sistema</ABox>
      </Appear>
      <Appear t={t} at={T.ia} style={{ left: 590, top: 474 }}>
        <GoldChip>✦ IA</GoldChip>
      </Appear>
      <Hand t={t} at={T.noEs} text="sí usa IA… pero no es un agente" color={C.mint} size={50} x={170} y={650} rotate={-1.5} />
    </Beat>

    {/* 7 · Not everything goes through a chat */}
    <Beat t={t} start={44.65} end={47.6}>
      <Appear t={t} at={44.7} kind="up" style={{ left: 300, top: 400 }}>
        <Bubble avatar={<MessageCircle size={38} color={C.ink} strokeWidth={2.2} />} avatarBg={C.yellow}>
          Escríbele al chat…
        </Bubble>
      </Appear>
      <Head t={t} text="No todo entra=entrar por un *chat*" from={44.65} top={520} size={64} />
      <Rough t={t} at={T.chat} shape={{ kind: "curve", pts: [[392, 470], [420, 404], [452, 474], [486, 402], [520, 472], [556, 400], [590, 470], [626, 402], [660, 468], [694, 404], [730, 466], [770, 410]] }} color={C.peach} width={8} roughness={1.1} seed={71} dur={0.55} />
      <Rough t={t} at={T.chat + 0.45} shape={{ kind: "curve", pts: [[400, 452], [436, 418], [470, 458], [508, 414], [546, 456], [584, 412], [622, 452], [662, 414], [700, 450], [742, 420]] }} color={C.peach} width={6} roughness={1.3} seed={73} dur={0.45} />
      <Appear t={t} at={T.claude} style={center(262)}>
        <Pill size={46} pad="16px 32px">
          <ClaudeLogo size={50} /> Claude
        </Pill>
      </Appear>
    </Beat>

    {/* 8 · Sometimes it is building systems that adapt to them */}
    <Beat t={t} start={T.aVeces - 0.05} end={50.95}>
      <Label t={t} at={T.aVeces} top={262} text="A veces es" />
      <Head t={t} text="Construir sistemas que *se* *adapten*" from={48.0} top={322} size={74} left={170} right={170} />
      <Appear t={t} at={T.adapten + 0.1} style={{ left: 420, top: 520 }}>
        <Tile t={t} size={110} bg={LILAC_TILE}>
          <SparkIcon size={58} color="#fff" strokeWidth={2.3} />
        </Tile>
      </Appear>
      <Hand t={t} at={T.adapten + 0.25} text="a su medida" color={C.mint} size={50} x={560} y={548} rotate={-5} />
    </Beat>

    {/* 9 · The one macOS window: dashboards and ERPs are not new (camera lowered) */}
    <Beat t={t} start={T.dashboard - 0.1} end={56.45}>
      <Appear t={t} at={T.dashboard} style={{ left: 150, top: 262 }}>
        <MacWindow t={t} at={T.dashboard} />
      </Appear>
      <Hand t={t} at={T.hace} text="hace años" color={C.yellow} size={52} x={690} y={586} rotate={-5} />
      <Rough t={t} at={T.hace + 0.3} shape={{ kind: "arrow", pts: [[680, 616], [620, 612], [585, 572]], head: 24 }} color={C.yellow} width={5} seed={81} />
      <Head t={t} text="Eso *no* *es* *nuevo*" from={55.4} top={650} size={78} />
    </Beat>
    {/* 10 · Ending take: now AI makes all of this faster and cheaper */}
    <Beat t={t} start={56.5} end={61.8}>
      <Label t={t} at={56.5} top={262} text="Pero ahora" strong="con IA:" />
      {[
        [<ChartColumn key="c" size={52} color="#fff" strokeWidth={2.4} />, SKY_TILE, -8],
        [<Zap key="z" size={52} color="#fff" strokeWidth={2.4} />, GOLD_TILE, 0],
        [<Database key="d" size={52} color="#fff" strokeWidth={2.4} />, MINT_TILE, 8],
      ].map(([icon, bg, tilt], i) => (
        <Appear key={i} t={t} at={T.crear + i * 0.2} style={{ left: 330 + i * 160, top: 322 }}>
          <Tile t={t} size={96} bg={bg as string} phase={i * 1.3} tilt={tilt as number}>
            {icon}
          </Tile>
        </Appear>
      ))}
      <Hand t={t} at={T.crear + 0.7} text="todo esto" color={C.lilac} size={46} x={820} y={350} rotate={-6} />
      <Head t={t} text="Más=más *rápido*=rápida y más *económico*=económica" from={59.7} top={452} size={62} left={50} right={50} />
      <Sparkles t={t} at={T.economica + 0.2} points={[[860, 540, 30], [890, 590, 20], [230, 470, 24]]} color={C.gold} />
    </Beat>

    {/* 11 · Call to action */}
    <Beat t={t} start={T.asi - 0.05} end={80}>
      <Label t={t} at={T.asi} top={262} text="Así que" strong="tú:" />
      <Head t={t} text="¿Qué=¿qué estás *creando*=crear con *IA?*=inteligencia" from={62.4} top={322} size={80} left={190} right={190} />
      <Hand t={t} at={T.crear2 + 0.3} text="cuéntame" color={C.mint} size={60} x={600} y={520} rotate={-5} />
      <Rough t={t} at={T.crear2 + 0.6} shape={{ kind: "arrow", pts: [[860, 560], [920, 620], [915, 700]], head: 26 }} color={C.mint} width={6} seed={91} />
    </Beat>
  </>
);

