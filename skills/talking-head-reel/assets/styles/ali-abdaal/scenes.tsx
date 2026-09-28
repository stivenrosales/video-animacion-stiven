import React from "react";
import { Briefcase, ChartColumn, Database, LayoutGrid, MessageCircle, Package } from "lucide-react";
import {
  Appear,
  Beat,
  Big,
  Bubble,
  Chip,
  ClaudeLogo,
  Cursor,
  DashCard,
  Doodle,
  Hand,
  Head,
  Label,
  MetaLogo,
  Num,
  Pill,
  PowerBILogo,
  QuestionCard,
  Sparkles,
  Tile,
  WhatsAppLogo,
  cue,
  ease,
} from "./ali";
import { C, clamp01, lerp, pop } from "./theme";

const GOLD_TILE = "linear-gradient(160deg,#FFE08A,#F5A623)";
const SKY_TILE = "linear-gradient(160deg,#9FE3FF,#3B9BEB)";
const LILAC_TILE = "linear-gradient(160deg,#DCCBFF,#8E6CF0)";
const PEACH_TILE = "linear-gradient(160deg,#FFC2A6,#F2784B)";
const CREAM_TILE = "linear-gradient(160deg,#FBF8F1,#EADFCF)";
const WHITE_TILE = "linear-gradient(160deg,#FFFFFF,#ECECEC)";

/** Centered row wrapper for absolutely positioned pops. */
const center = (top: number): React.CSSProperties => ({ left: 0, right: 0, top, display: "flex", justifyContent: "center" });

/** Inline pop for items laid out in a flex row. */
const PopIn: React.FC<{ t: number; at: number; children: React.ReactNode }> = ({ t, at, children }) => {
  const p = pop(t, at, { damping: 11, stiffness: 210, mass: 0.6 });
  return <div style={{ opacity: clamp01((t - at) / 0.12), transform: `scale(${lerp(0.45, 1, p)})` }}>{children}</div>;
};

// Word cues used by several pieces and the SFX track (absolute seconds on the edited timeline).
const T = {
  whatsapp: cue("WhatsApp", 5.3),
  gerente: cue("gerente", 6.5),
  dashA: 11.55,
  dashAWord: cue("dashboard", 11.9),
  meta: cue("Meta", 13.9),
  limites: cue("limitaciones", 15.9),
  dashB: cue("dashboard", 20.2),
  clic: cue("clic y listo", 21.3),
  mcp: cue("MCPs", 24.9),
  salio: cue("salió", 26.0),
  interesantes: cue("interesantes", 28.5),
  empaquetar: cue("empaquetar", 30.9),
  aplicacion: cue("aplicación", 33.4),
  power: cue("Power", 35.7),
  dashC: cue("dashboard", 36.7),
  llevas: cue("llevas", 38.3),
  claudeCode: cue("Claude", 39.8),
  ventajas: cue("ventajas", 41.2),
  primero: cue("primero", 45.4),
  segundo: cue("segundo", 47.3),
  mcpOne: cue("MCP", 49.9),
  gasto: cue("gasto", 51.0),
  conectando: cue("conectando", 53.3),
  claudeB: cue("Claude", 54.9),
  gastan: cue("gastan", 55.5),
  suscripcion: cue("suscripción", 57.3),
  claudeC: cue("Claude", 61.3),
  software: cue("software", 68.0),
  saas: cue("SaaS", 69.0),
  erp: cue("ERP", 69.8),
  claudeD: cue("Claude", 71.2),
  limitaciones: cue("limitaciones", 73.0),
  bases: cue("bases", 74.1),
  cuentame: cue("cuéntame", 77.2),
};

export const CUES = {
  tecleo: [0.3, 1.5, 2.7],
  aparicion: [T.whatsapp, T.gerente, T.dashA, T.meta, T.dashB, T.mcp, T.empaquetar, T.power, T.dashC, T.claudeCode, T.conectando, T.claudeB, T.suscripcion, T.software, T.saas, T.erp, T.claudeD, T.bases],
  clic: [T.clic],
  check: [T.primero, T.segundo],
  exito: [T.gasto],
  transicion: [13.3, 24.1, 29.6, 40.6, 63.0, 77.33],
  timelapse: [T.gasto - 1.5],
};

export const Scenes: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* 1 · Hook: the question he asked himself */}
    <Beat t={t} start={0} end={4.02}>
      <Label t={t} at={0.05} top={268} text="Una pregunta que" strong="me hice:" />
      <Appear t={t} at={0.15} kind="up" style={{ left: 110, right: 110, top: 335 }}>
        <QuestionCard t={t} t0={0.3} t1={3.7} text="¿Diseñar agentes de WhatsApp es lo más efectivo para empresas?" />
      </Appear>
    </Beat>

    {/* 2a · Everyone runs the business on WhatsApp */}
    <Beat t={t} start={4.1} end={11.35}>
      <Appear t={t} at={T.whatsapp} style={center(268)}>
        <Pill>
          <WhatsAppLogo size={62} /> WhatsApp
        </Pill>
      </Appear>
      <Appear t={t} at={T.gerente} kind="up" style={{ left: 100, top: 440 }}>
        <Bubble avatar={<Briefcase size={40} color={C.ink} strokeWidth={2.2} />} avatarBg={C.yellow}>
          ¿Cuánto vendimos hoy?
        </Bubble>
      </Appear>
      <Hand t={t} at={T.gerente + 0.25} text="el gerente" color={C.mint} x={760} y={366} rotate={-6} size={58} />
      <Doodle t={t} at={T.gerente + 0.55} d="M 860 438 C 872 470, 846 492, 800 494" tip="M 816 478 L 798 494 L 818 508" color={C.mint} width={6} />
    </Beat>

    {/* 2b · ...instead of opening a dashboard */}
    <Beat t={t} start={11.4} end={13.22}>
      <Appear t={t} at={T.dashA} style={center(290)}>
        <DashCard w={480} />
      </Appear>
      <Doodle t={t} at={T.dashAWord + 0.15} d="M 330 300 L 750 548" tip="M 750 300 L 330 548" color={C.peach} width={12} dur={0.3} />
    </Beat>

    {/* 3 · Meta will charge for it */}
    <Beat t={t} start={13.3} end={20.05}>
      <Appear t={t} at={T.meta} style={center(262)}>
        <Pill size={48} pad="16px 30px">
          <MetaLogo size={56} /> Meta
        </Pill>
      </Appear>
      <Head t={t} text="Va a *cobrar* por eso" from={14.6} top={392} size={78} />
      <Hand t={t} at={T.limites} text="+ límites de conversación" color={C.peach} y={500} center size={60} />
      <Doodle t={t} at={T.limites + 0.8} d="M 290 576 C 420 564, 650 570, 800 560" color={C.peach} width={6} />
    </Beat>

    {/* 4 · A dashboard was one click away */}
    <Beat t={t} start={20.1} end={22.55}>
      <Appear t={t} at={T.dashB} style={center(280)}>
        <DashCard w={440} />
      </Appear>
      {t >= T.dashB + 0.3 && (
        <div
          style={{
            position: "absolute",
            left: lerp(860, 600, ease(t, T.dashB + 0.3, 0.8)),
            top: lerp(640, 440, ease(t, T.dashB + 0.3, 0.8)),
            transform: `scale(${t >= T.clic && t < T.clic + 0.14 ? 0.84 : 1})`,
            opacity: clamp01((t - T.dashB - 0.3) / 0.15),
          }}
        >
          <Cursor size={76} />
        </div>
      )}
      <Hand t={t} at={T.clic + 0.1} text="1 clic y listo" color={C.mint} y={548} center size={60} rotate={-3} />
    </Beat>

    {/* 5 · Move to another solution */}
    <Beat t={t} start={22.6} end={24.05}>
      <Head t={t} text="Podríamos migrar a *otra* *solución*" from={22.6} top={320} size={78} />
    </Beat>

    {/* 6 · MCP */}
    <Beat t={t} start={24.1} end={29.55}>
      <Appear t={t} at={T.mcp} style={center(262)}>
        <Big size={210}>MCP</Big>
      </Appear>
      <Label t={t} at={T.mcp + 0.4} top={486} text="Model Context" strong="Protocol" size={34} />
      <Hand t={t} at={T.salio} text="(no es nuevo)" color={C.lilac} y={546} center size={54} rotate={-2} />
      <Sparkles t={t} at={T.interesantes} points={[[250, 300, 56], [228, 452, 36], [860, 470, 44], [300, 520, 30]]} />
    </Beat>

    {/* 7 · Package a service */}
    <Beat t={t} start={29.6} end={35.45}>
      <Appear t={t} at={T.empaquetar} style={center(262)}>
        <Tile t={t} size={170} bg={GOLD_TILE}>
          <Package size={96} color="#fff" strokeWidth={2.2} />
        </Tile>
      </Appear>
      <Head t={t} text="Empaquetar un *servicio*" from={31.3} top={472} size={74} />
      <Hand t={t} at={T.aplicacion} text="o una aplicación" color={C.mint} x={640} y={300} rotate={-6} size={52} />
    </Beat>

    {/* 8 · Your Power BI / dashboard → Claude Code */}
    <Beat t={t} start={35.5} end={40.55}>
      <Doodle t={t} at={T.power - 0.2} d="M 150 440 C 150 360, 930 330, 930 420 C 930 510, 150 540, 150 440" color="rgba(255,255,255,.55)" width={3} dur={0.7} />
      <Appear t={t} at={T.power} style={{ left: 140, top: 330 }}>
        <Tile t={t} size={150} bg={WHITE_TILE} tilt={-6}>
          <PowerBILogo size={92} />
        </Tile>
      </Appear>
      <Hand t={t} at={T.power + 0.25} text="Power BI" color={C.white} x={140} y={500} rotate={-4} size={50} />
      <Appear t={t} at={T.dashC} style={{ left: 790, top: 340 }}>
        <Tile t={t} size={150} bg={SKY_TILE} tilt={6} phase={1.3}>
          <ChartColumn size={84} color="#fff" strokeWidth={2.2} />
        </Tile>
      </Appear>
      <Hand t={t} at={T.dashC + 0.25} text="tu dashboard" color={C.white} x={720} y={508} rotate={4} size={50} />
      <Doodle t={t} at={T.llevas} d="M 300 400 C 350 376, 392 376, 432 392" tip="M 414 378 L 434 393 L 412 404" color={C.mint} width={6} dur={0.35} />
      <Doodle t={t} at={T.llevas + 0.15} d="M 782 412 C 732 386, 690 386, 650 402" tip="M 668 388 L 648 403 L 670 414" color={C.mint} width={6} dur={0.35} />
      <Appear t={t} at={T.claudeCode} style={{ left: 445, top: 300 }}>
        <Tile t={t} size={190} bg={CREAM_TILE} phase={2.4}>
          <ClaudeLogo size={112} />
        </Tile>
      </Appear>
      <Appear t={t} at={T.claudeCode + 0.2} style={center(512)}>
        <Pill size={36} pad="10px 24px">
          <ClaudeLogo size={38} /> Claude Code
        </Pill>
      </Appear>
    </Beat>

    {/* 9 · Advantages: with WhatsApp agents… */}
    <Beat t={t} start={40.6} end={45.62}>
      <Label t={t} at={T.ventajas} top={268} text="Bastantes" strong="ventajas" />
      <Head t={t} text="Cuando usas *agentes* de WhatsApp" from={42.6} top={352} size={74} />
    </Beat>

    {/* 10 · You pay twice */}
    <Beat t={t} start={45.62} end={49.28}>
      <div style={{ position: "absolute", ...center(270) }}>
        {t < T.segundo - 0.05 ? <Num t={t} at={T.primero} n="1" /> : <Num t={t} at={T.segundo} n="2" />}
      </div>
      {t < T.segundo - 0.05 ? (
        <Head t={t} text="Gastas en los *mensajes*" from={45.9} top={420} size={76} />
      ) : (
        <Head t={t} text="En la *IA*=inteligencia que consumen" from={47.7} top={420} size={76} />
      )}
    </Beat>

    {/* 11 · With an MCP: S/ 0 */}
    <Beat t={t} start={49.3} end={52.38}>
      <Label t={t} at={T.mcpOne} top={268} text="Con un" strong="MCP" />
      <Appear t={t} at={T.gasto} style={center(334)}>
        <Big size={240}>S/ 0</Big>
      </Appear>
      <Sparkles t={t} at={T.gasto + 0.15} points={[[250, 360, 52], [840, 340, 44], [300, 560, 34], [800, 560, 40]]} />
    </Beat>

    {/* 12 · Connect an app to Claude; they pay their own subscription */}
    <Beat t={t} start={52.4} end={59.62}>
      <Appear t={t} at={T.conectando} style={{ left: 190, top: 350 }}>
        <Tile t={t} size={160} bg={LILAC_TILE}>
          <LayoutGrid size={88} color="#fff" strokeWidth={2.2} />
        </Tile>
      </Appear>
      <Hand t={t} at={T.conectando + 0.2} text="tu app" color={C.white} x={205} y={522} size={50} />
      <Doodle t={t} at={T.conectando + 0.4} d="M 368 430 C 440 380, 520 480, 600 430 S 690 398, 722 430" color={C.white} width={6} dur={0.55} />
      <Appear t={t} at={T.claudeB} style={{ left: 730, top: 350 }}>
        <Tile t={t} size={160} bg={CREAM_TILE} phase={1.7}>
          <ClaudeLogo size={96} />
        </Tile>
      </Appear>
      <Hand t={t} at={T.gastan} text="ellos pagan la IA" color={C.mint} x={590} y={528} rotate={-3} size={50} />
      <Appear t={t} at={T.suscripcion} style={center(262)}>
        <Pill size={36} pad="10px 24px">
          <ClaudeLogo size={38} /> Suscripción de Claude
        </Pill>
      </Appear>
    </Beat>

    {/* 13 · More personalised */}
    <Beat t={t} start={59.65} end={62.95}>
      <Head t={t} text="Mucho más *personalizado*" from={60.1} top={330} size={80} />
      <Hand t={t} at={T.claudeC} text="+ cosas más grandes" color={C.peach} y={476} center size={58} />
      <Sparkles t={t} at={T.claudeC + 0.4} points={[[220, 330, 44], [870, 360, 38]]} />
    </Beat>

    {/* 14 · Not an agent: a tool that connects your software to Claude */}
    <Beat t={t} start={63.0} end={72.85}>
      <Head t={t} text="Un agente de IA=inteligencia" from={64.5} top={276} size={70} />
      <Doodle t={t} at={65.8} d="M 262 320 C 450 308, 650 328, 820 314" color={C.peach} width={9} dur={0.35} />
      <Head t={t} text="Una *herramienta*" from={66.5} top={388} size={84} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 516, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <PopIn t={t} at={T.software}>
          <Chip>Software</Chip>
        </PopIn>
        <PopIn t={t} at={T.saas}>
          <Chip>SaaS</Chip>
        </PopIn>
        <PopIn t={t} at={T.erp}>
          <Chip>ERP</Chip>
        </PopIn>
        <div style={{ width: 60, opacity: clamp01((t - T.claudeD + 0.25) / 0.2), fontFamily: "sans-serif", fontSize: 50, color: C.mint, textAlign: "center" }}>→</div>
        <PopIn t={t} at={T.claudeD}>
          <Chip>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <ClaudeLogo size={38} /> Claude
            </span>
          </Chip>
        </PopIn>
      </div>
    </Beat>

    {/* 15 · Limitation: big databases */}
    <Beat t={t} start={72.9} end={75.75}>
      <Label t={t} at={T.limitaciones} top={268} text="Algunas" strong="limitaciones" />
      <Appear t={t} at={T.bases} style={center(340)}>
        <Tile t={t} size={160} bg={PEACH_TILE}>
          <Database size={88} color="#fff" strokeWidth={2.2} />
        </Tile>
      </Appear>
      <Hand t={t} at={T.bases + 0.2} text="bases de datos grandes" color={C.peach} y={524} center size={56} />
      <Doodle t={t} at={T.bases + 0.9} d="M 300 598 C 430 588, 650 594, 790 584" color={C.peach} width={6} />
    </Beat>

    {/* 16 · But it's a good direction */}
    <Beat t={t} start={75.8} end={77.3}>
      <Head t={t} text="Una *buena* *dirección*" from={76.3} top={330} size={82} />
    </Beat>

    {/* 17 · CTA */}
    <Beat t={t} start={77.33} end={90}>
      <Head t={t} text="¿Tú cómo integrarías *IA*=inteligencia en una empresa?" from={77.6} top={276} size={72} />
      <Hand t={t} at={T.cuentame} text="cuéntame" color={C.yellow} x={560} y={470} rotate={-5} size={68} />
      <Appear t={t} at={T.cuentame + 0.4} style={{ left: 846, top: 468 }}>
        <MessageCircle size={72} color={C.yellow} strokeWidth={2.4} />
      </Appear>
    </Beat>
  </>
);
