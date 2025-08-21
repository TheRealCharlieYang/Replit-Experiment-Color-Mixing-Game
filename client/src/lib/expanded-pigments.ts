import type { Pigment } from "@shared/schema";

// Comprehensive pigment palette with accurate OKLab values for realistic color mixing
export const EXPANDED_PIGMENTS: Pigment[] = [
  // Whites
  {
    id: "pw6",
    name: "Titanium White",
    code: "PW6",
    swatchHex: "#F2F2F2",
    colorant: { L: 0.96, a: 0.00, b: 0.00 },
    description: "Opaque, bright white with excellent covering power."
  },
  {
    id: "pw1",
    name: "Zinc White",
    code: "PW1", 
    swatchHex: "#FEFEFE",
    colorant: { L: 0.98, a: 0.00, b: 0.00 },
    description: "Transparent white, perfect for subtle tinting."
  },
  {
    id: "pw4",
    name: "Buff Titanium",
    code: "PW4",
    swatchHex: "#DAD2C6",
    colorant: { L: 0.85, a: 0.02, b: 0.05 },
    description: "Unbleached warmth; bone, parchment, and beach sand."
  },
  
  // Blacks and Grays
  {
    id: "pbk9", 
    name: "Ivory Black",
    code: "PBk9",
    swatchHex: "#1C1C1C",
    colorant: { L: 0.15, a: 0.00, b: 0.00 },
    description: "Warm black with subtle brown undertones."
  },
  {
    id: "pbk7",
    name: "Mars Black",
    code: "PBk7",
    swatchHex: "#0F0F0F",
    colorant: { L: 0.12, a: 0.00, b: 0.00 },
    description: "Dense, opaque black for strong contrasts."
  },
  {
    id: "pg1",
    name: "Payne's Gray",
    code: "PG1",
    swatchHex: "#53606B",
    colorant: { L: 0.42, a: -0.02, b: -0.05 },
    description: "Elegant blue-gray that replaces black in skies and steel."
  },
  {
    id: "ng1",
    name: "Neutral Gray",
    code: "NG1",
    swatchHex: "#808080",
    colorant: { L: 0.55, a: 0.00, b: 0.00 },
    description: "Value control—calms chroma without steering hue."
  },
  {
    id: "pg2",
    name: "Davy's Gray",
    code: "PG2",
    swatchHex: "#5E6E66",
    colorant: { L: 0.45, a: -0.02, b: 0.02 },
    description: "Moody, mist-ready green-gray for rain and stone."
  },
  
  // Yellows
  {
    id: "py35",
    name: "Cadmium Yellow", 
    code: "PY35",
    swatchHex: "#FFD200",
    colorant: { L: 0.88, a: 0.02, b: 0.18 },
    description: "Bright, opaque yellow for high-chroma mixes without mud."
  },
  {
    id: "py3",
    name: "Lemon Yellow",
    code: "PY3",
    swatchHex: "#FFF44F",
    colorant: { L: 0.92, a: -0.08, b: 0.22 },
    description: "Crisp cool yellow that snaps greens to life in daylight glazes."
  },
  {
    id: "py83",
    name: "Indian Yellow",
    code: "PY83",
    swatchHex: "#FFB000",
    colorant: { L: 0.78, a: 0.08, b: 0.20 },
    description: "Golden, transparent glow—the glaze that makes sunsets breathe."
  },
  {
    id: "py74",
    name: "Hansa Yellow Medium",
    code: "PY74",
    swatchHex: "#F7D038",
    colorant: { L: 0.85, a: 0.00, b: 0.16 },
    description: "Clean workhorse yellow for high-chroma mixes without mud."
  },
  {
    id: "py184",
    name: "Bismuth Yellow",
    code: "PY184",
    swatchHex: "#F9E04C",
    colorant: { L: 0.89, a: -0.02, b: 0.18 },
    description: "Bright, nontoxic cadmium stand-in for sparkling highlights."
  },
  {
    id: "py154",
    name: "Naples Yellow",
    code: "PY154",
    swatchHex: "#F4E0A3",
    colorant: { L: 0.88, a: 0.02, b: 0.08 },
    description: "Buttery, opaque sunshine for skin highlights and warm light."
  },
  {
    id: "py43",
    name: "Yellow Ochre",
    code: "PY43", 
    swatchHex: "#C6862B",
    colorant: { L: 0.62, a: 0.05, b: 0.12 },
    description: "Earthy foundation—tone your canvas and warm every midtone."
  },
  
  // Oranges
  {
    id: "po20",
    name: "Cadmium Orange",
    code: "PO20",
    swatchHex: "#FF7F2A",
    colorant: { L: 0.68, a: 0.18, b: 0.16 },
    description: "Opaque blaze for fiery clouds and late-afternoon masonry."
  },
  
  // Reds
  {
    id: "pr108",
    name: "Cadmium Red",
    code: "PR108",
    swatchHex: "#E03C31", 
    colorant: { L: 0.55, a: 0.22, b: 0.14 },
    description: "Bright, opaque red for bold statements and pure chroma."
  },
  {
    id: "pr254",
    name: "Scarlet Lake",
    code: "PR254",
    swatchHex: "#FF2400",
    colorant: { L: 0.58, a: 0.28, b: 0.18 },
    description: "FIRE! The quick accent that commands attention."
  },
  {
    id: "pr188",
    name: "Vermilion",
    code: "PR188",
    swatchHex: "#E34234",
    colorant: { L: 0.56, a: 0.24, b: 0.16 },
    description: "Imperial warmth that beats like a pulse under skin and silk."
  },
  {
    id: "pr177",
    name: "Alizarin Crimson",
    code: "PR177",
    swatchHex: "#8A2232",
    colorant: { L: 0.32, a: 0.18, b: 0.08 },
    description: "Deep crimson for velvet darks and romantic glazes."
  },
  {
    id: "pr19",
    name: "Carmine",
    code: "PR19",
    swatchHex: "#A50034",
    colorant: { L: 0.38, a: 0.25, b: 0.05 },
    description: "Velvet theatre red for drapery and crimson twilight."
  },
  {
    id: "pr209",
    name: "Quinacridone Red",
    code: "PR209",
    swatchHex: "#D12C4F",
    colorant: { L: 0.48, a: 0.25, b: 0.05 },
    description: "Transparent punch that glows through layered passages."
  },
  {
    id: "pr122",
    name: "Quinacridone Rose",
    code: "PR122",
    swatchHex: "#D95A8F",
    colorant: { L: 0.58, a: 0.22, b: -0.05 },
    description: "Cool bloom—petals, dawn clouds, and romantic glazes."
  },
  {
    id: "pr170",
    name: "Permanent Rose",
    code: "PR170",
    swatchHex: "#E03C8A",
    colorant: { L: 0.55, a: 0.28, b: -0.08 },
    description: "Clean pinks that won't chalk, perfect for flushed light."
  },
  {
    id: "pr83",
    name: "Rose Madder Hue",
    code: "PR83",
    swatchHex: "#E3A1B8",
    colorant: { L: 0.72, a: 0.15, b: -0.02 },
    description: "Victorian rose—delicate glazes with nostalgic softness."
  },
  {
    id: "pr101",
    name: "Indian Red",
    code: "PR101",
    swatchHex: "#7E2A2A",
    colorant: { L: 0.32, a: 0.15, b: 0.08 },
    description: "Dense iron warmth—steadies complexions and ancient walls."
  },
  {
    id: "pr102",
    name: "English Red Light Red",
    code: "PR102",
    swatchHex: "#B24C2B",
    colorant: { L: 0.42, a: 0.18, b: 0.12 },
    description: "Terracotta warmth that anchors flesh and brick."
  },
  {
    id: "pr101v",
    name: "Venetian Red",
    code: "PR101",
    swatchHex: "#9E3A2B",
    colorant: { L: 0.38, a: 0.16, b: 0.10 },
    description: "Renaissance brick—classic cheeks, cloaks, and rooftops."
  },
  {
    id: "pr233",
    name: "Transparent Oxide Red",
    code: "PR233",
    swatchHex: "#A34222",
    colorant: { L: 0.42, a: 0.20, b: 0.12 },
    description: "A ruby glaze that ignites landscapes without weight."
  },
  
  // Purples and Violets
  {
    id: "pv14",
    name: "Cobalt Violet Light",
    code: "PV14",
    swatchHex: "#A98AC5",
    colorant: { L: 0.62, a: 0.08, b: -0.15 },
    description: "Whispered lilac for atmospheric distance and skin cools."
  },
  {
    id: "pv14d",
    name: "Cobalt Violet Deep",
    code: "PV14",
    swatchHex: "#774C9E",
    colorant: { L: 0.42, a: 0.15, b: -0.18 },
    description: "Mineral royalty deepens evening shadows with restraint."
  },
  {
    id: "pv23",
    name: "Dioxazine Purple",
    code: "PV23",
    swatchHex: "#4A2C6F",
    colorant: { L: 0.28, a: 0.12, b: -0.22 },
    description: "Electric violet—one drop turns twilight dramatic."
  },
  {
    id: "pv42",
    name: "Mauve",
    code: "PV42",
    swatchHex: "#B190B6",
    colorant: { L: 0.65, a: 0.08, b: -0.08 },
    description: "Powdery haze that softens horizons and quiets form."
  },
  {
    id: "pv16",
    name: "Mars Violet Caput Mortuum",
    code: "PV16",
    swatchHex: "#5E2D3A",
    colorant: { L: 0.25, a: 0.10, b: -0.05 },
    description: "Ancient wine—a solemn shadow for robes and rock."
  },
  {
    id: "pv49",
    name: "Lavender",
    code: "PV49",
    swatchHex: "#C9B6E4",
    colorant: { L: 0.75, a: 0.05, b: -0.12 },
    description: "Misty veil; Monet's air in a tube."
  },
  
  // Blues (Fixed for proper yellow+blue=green mixing)
  {
    id: "pb28",
    name: "Cobalt Blue",
    code: "PB28",
    swatchHex: "#3A5DAE",
    colorant: { L: 0.45, a: -0.02, b: -0.28 },
    description: "Breezy mineral blue for honest daylight skies."
  },
  {
    id: "pb35",
    name: "Cerulean Blue",
    code: "PB35",
    swatchHex: "#2A7FBA",
    colorant: { L: 0.55, a: -0.08, b: -0.22 },
    description: "Milky, granulating sky tone; instant sea air."
  },
  {
    id: "pb33",
    name: "Manganese Blue Hue",
    code: "PB33",
    swatchHex: "#3AA6DE",
    colorant: { L: 0.68, a: -0.12, b: -0.18 },
    description: "Luminous water sparkle and high-key skies."
  },
  {
    id: "pb27",
    name: "Prussian Blue",
    code: "PB27",
    swatchHex: "#0B3C5D",
    colorant: { L: 0.28, a: -0.05, b: -0.18 },
    description: "Inky depth that builds forests and night seas."
  },
  {
    id: "pb29",
    name: "Ultramarine Blue",
    code: "PB29", 
    swatchHex: "#3F4BA0",
    colorant: { L: 0.42, a: -0.05, b: -0.25 },
    description: "Classic blue for honest daylight skies."
  },
  {
    id: "pb60",
    name: "Indigo",
    code: "PB60",
    swatchHex: "#26457D",
    colorant: { L: 0.32, a: -0.02, b: -0.20 },
    description: "Storm-borne twilight for brooding glazes."
  },
  {
    id: "pb15",
    name: "Phthalo Blue",
    code: "PB15",
    swatchHex: "#0F4C81",
    colorant: { L: 0.35, a: -0.08, b: -0.22 },
    description: "Deep blue with green undertones for mixing."
  },
  {
    id: "kb1",
    name: "King's Blue",
    code: "KB1",
    swatchHex: "#8FB9E6",
    colorant: { L: 0.75, a: -0.05, b: -0.15 },
    description: "Historical sky mix—white-kissed blue for porcelain light."
  },
  {
    id: "az1",
    name: "Azure",
    code: "AZ1",
    swatchHex: "#007FFF",
    colorant: { L: 0.62, a: -0.08, b: -0.25 },
    description: "High-noon clarity; the clean edge of summer."
  },
  {
    id: "pb36",
    name: "Cobalt Turquoise",
    code: "PB36",
    swatchHex: "#2FB8B6",
    colorant: { L: 0.72, a: -0.18, b: -0.08 },
    description: "Glass-sea brilliance for sunlit shallows."
  },
  {
    id: "pb74",
    name: "Cobalt Teal",
    code: "PB74",
    swatchHex: "#34C6B6",
    colorant: { L: 0.78, a: -0.20, b: -0.05 },
    description: "Minted surf that cools skin and stone."
  },
  {
    id: "pg50t",
    name: "Phthalo Turquoise",
    code: "PG50",
    swatchHex: "#006D77",
    colorant: { L: 0.45, a: -0.15, b: -0.08 },
    description: "Petrol depth—oceans, beetle shells, and steel reflections."
  },
  
  // Greens
  {
    id: "pg18", 
    name: "Viridian",
    code: "PG18",
    swatchHex: "#1B8A6B",
    colorant: { L: 0.52, a: -0.18, b: 0.08 },
    description: "Transparent, cool green for crystalline shadows."
  },
  {
    id: "pg7", 
    name: "Phthalo Green",
    code: "PG7",
    swatchHex: "#00836C",
    colorant: { L: 0.48, a: -0.15, b: 0.05 },
    description: "Blue-green for crystalline shadows and mixing."
  },
  {
    id: "pg36",
    name: "Sap Green",
    code: "PG36",
    swatchHex: "#507D2A",
    colorant: { L: 0.45, a: -0.08, b: 0.18 },
    description: "Leafy workhorse—mixable greens that feel lived-in."
  },
  {
    id: "pg8",
    name: "Hooker's Green",
    code: "PG8",
    swatchHex: "#3B6E3B",
    colorant: { L: 0.42, a: -0.10, b: 0.15 },
    description: "Victorian landscape staple for hedges and pine."
  },
  {
    id: "pg17",
    name: "Chromium Oxide Green",
    code: "PG17",
    swatchHex: "#4F7D4A",
    colorant: { L: 0.48, a: -0.12, b: 0.12 },
    description: "Opaque moss; the secret to believable foliage."
  },
  {
    id: "pg23",
    name: "Terre Verte",
    code: "PG23",
    swatchHex: "#7BA05B",
    colorant: { L: 0.58, a: -0.10, b: 0.15 },
    description: "Classical green underpainting for luminous flesh."
  },
  {
    id: "py129",
    name: "Olive Green",
    code: "PY129",
    swatchHex: "#6B8E23",
    colorant: { L: 0.52, a: -0.05, b: 0.20 },
    description: "Dusty, sun-baked leaves and Mediterranean shadow."
  },
  {
    id: "pg50",
    name: "Cobalt Green",
    code: "PG50",
    swatchHex: "#6FBF9B",
    colorant: { L: 0.72, a: -0.15, b: 0.08 },
    description: "Pale mineral green for distance and air."
  },
  {
    id: "pg55",
    name: "Emerald Green Modern",
    code: "PG55",
    swatchHex: "#00A776",
    colorant: { L: 0.62, a: -0.22, b: 0.12 },
    description: "Safer emerald sparkle for accents and fairy light."
  },
  {
    id: "pg12",
    name: "Permanent Green Light",
    code: "PG12",
    swatchHex: "#74D055",
    colorant: { L: 0.78, a: -0.18, b: 0.22 },
    description: "Spring shoots and fresh highlights—zing without chalk."
  },
  
  // Browns and Earth Tones
  {
    id: "pbr7r",
    name: "Raw Sienna",
    code: "PBr7",
    swatchHex: "#C08A3E",
    colorant: { L: 0.58, a: 0.08, b: 0.15 },
    description: "Earthy foundation—tone your canvas and warm every midtone."
  },
  {
    id: "pbr7ru",
    name: "Raw Umber",
    code: "PBr7",
    swatchHex: "#6B4E2E",
    colorant: { L: 0.35, a: 0.05, b: 0.08 },
    description: "Fast-drying neutralizer; the underpainting's best friend."
  },
  {
    id: "pbr7u",
    name: "Burnt Umber",
    code: "PBr7",
    swatchHex: "#7E4A25",
    colorant: { L: 0.32, a: 0.08, b: 0.10 },
    description: "Chocolate shadows that deepen portraits and woodgrain."
  },
  {
    id: "pbr7",
    name: "Burnt Sienna", 
    code: "PBr7",
    swatchHex: "#8A3B12",
    colorant: { L: 0.35, a: 0.12, b: 0.08 },
    description: "Chocolate shadows for portraits and wood textures."
  },
  {
    id: "pbr8",
    name: "Van Dyke Brown",
    code: "PBr8",
    swatchHex: "#5A3A2B",
    colorant: { L: 0.28, a: 0.06, b: 0.06 },
    description: "Smoky, old-master depth for velvet darks."
  }
];
