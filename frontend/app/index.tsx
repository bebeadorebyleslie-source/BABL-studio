import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  ImageSourcePropType,
  Pressable,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import icon1 from "../assets/images/icon1.png";
import icon2 from "../assets/images/icon2.png";
import icon3 from "../assets/images/icon3.png";

import Header from "../src/components/Header";
import Workspace, { BEAD_STACK_OVERLAP_PX, CompositionBead, NATURAL_HEIGHT } from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";
import PerlesSiliconePanel from "../src/components/panels/PerlesSiliconePanel";
import PerlesBoisPanel from "../src/components/panels/PerlesBoisPanel";
import CrochetPanel from "../src/components/panels/CrochetPanel";
import FormesPanel from "../src/components/panels/FormesPanel";
import LettresPanel from "../src/components/panels/LettresPanel";
import BeadActionMenu from "../src/components/BeadActionMenu";

import {
  getColorById,
  SILICONE_COLORS,
  SILICONE_VARIANTS,
  getVariantById,
  getSiliconeLentilleImageByColorId,
  getSiliconeEtoileImageByColorId,
  getSiliconeHexImageByColorId,
  getSiliconeHexDimensionsByColorId,
} from "../src/data/silicone-colors";
import { WOOD_COLORS, WOOD_VARIANTS, getWoodVariantById } from "../src/data/wood-beads";
import { CROCHET_COLORS, CROCHET_SIZE_MM, CROCHET_VARIANT_ID } from "../src/data/crochet-beads";
import { FORMES_VARIANTS, getFormeDimensionsByVariantId, getFormeVariantById } from "../src/data/formes-beads";
import { LETTRES_VARIANTS, LETTRES_SPECIALES_VARIANTS, getLettreVariantById } from "../src/data/lettres-beads";
import { MM } from "../src/constants/sizes";
import { DEFAULT_CLIP_MODEL } from "../src/data/clip-models";
import { TEMPLATE_INNER_HEIGHT_PX } from "../src/components/Workspace";

type PanelState = { family: string; mode: "add" | "replace"; beadId?: string } | null;
type PersonalizationMode = "engraving" | "letters" | "none";

const INITIAL_COMPOSITION: CompositionBead[] = [];

const PERLES_SILICONE_ID = "perles-silicone";
const PERLES_BOIS_ID = "perles-bois";
const CROCHET_ID = "crochet";
const FORMES_ID = "formes";
const LETTRES_ID = "lettres";
const LEAF_FORME_VARIANT_IDS = new Set(["forme-feuillesiliconebas", "forme-feuillesiliconehaut"]);
const MAX_CROCHET_BEADS = 4;
const CLIP_SIZE_PX = 180;
const CLIP_TEMPLATE_OVERLAP_PX = 18;
const TEMPLATE_TOP_PX = CLIP_SIZE_PX - CLIP_TEMPLATE_OVERLAP_PX;

const PERSONALIZATION_OPTIONS: {
  id: PersonalizationMode;
  icon: ImageSourcePropType;
  title: string;
  description: string;
}[] = [
  {
    id: "engraving",
    icon: icon1,
    title: "Prénom gravé",
    description: "Le prénom est gravé directement sur le clip en bois.",
  },
  {
    id: "letters",
    icon: icon2,
    title: "Prénom en lettres",
    description: "Le prénom est composé avec des perles lettres en bois sur l'attache-tétine.",
  },
  {
    id: "none",
    icon: icon3,
    title: "Sans prénom",
    description: "Une création épurée, sans personnalisation du prénom.",
  },
];

const SUPPORTED_LETTERS = new Set([
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  "À",
  "Ä",
  "Ç",
  "È",
  "É",
  "Ê",
  "Ë",
  "Î",
  "Ï",
  "Ô",
  "Ö",
  "Ù",
  "Û",
  "Ÿ",
]);

const normalizeNameToLetters = (value: string): string[] =>
  Array.from(value.normalize("NFC").toUpperCase())
    .filter((char) => SUPPORTED_LETTERS.has(char))
    .slice(0, 12);

const LETTER_ID_BY_CHAR: Record<string, string> = {
  A: "lettre-a",
  B: "lettre-b",
  C: "lettre-c",
  D: "lettre-d",
  E: "lettre-e",
  F: "lettre-f",
  G: "lettre-g",
  H: "lettre-h",
  I: "lettre-i",
  J: "lettre-j",
  K: "lettre-k",
  L: "lettre-l",
  M: "lettre-m",
  N: "lettre-n",
  O: "lettre-o",
  P: "lettre-p",
  Q: "lettre-q",
  R: "lettre-r",
  S: "lettre-s",
  T: "lettre-t",
  U: "lettre-u",
  V: "lettre-v",
  W: "lettre-w",
  X: "lettre-x",
  Y: "lettre-y",
  Z: "lettre-z",
  "À": "lettre-special-1",
  "Ä": "lettre-special-2",
  "Ç": "lettre-special-3",
  "È": "lettre-special-4",
  "É": "lettre-special-5",
  "Ê": "lettre-special-6",
  "Ë": "lettre-special-7",
  "Î": "lettre-special-8",
  "Ï": "lettre-special-9",
  "Ô": "lettre-special-10",
  "Ö": "lettre-special-11",
  "Ù": "lettre-special-12",
  "Û": "lettre-special-13",
  "Ÿ": "lettre-special-14",
};

const getLetterVariantIdFromChar = (char: string) => LETTER_ID_BY_CHAR[char] ?? null;

const asModuleAsset = (source?: ImageSourcePropType | null): number | null =>
  typeof source === "number" ? source : null;

const uniqueModuleAssets = (sources: Array<ImageSourcePropType | null | undefined>) => {
  const set = new Set<number>();
  sources.forEach((source) => {
    const moduleId = asModuleAsset(source);
    if (moduleId) set.add(moduleId);
  });
  return [...set];
};

const preloadModulesInBatches = async (moduleIds: number[], batchSize = 16) => {
  for (let i = 0; i < moduleIds.length; i += batchSize) {
    const chunk = moduleIds.slice(i, i + batchSize);
    await Promise.allSettled(chunk.map((moduleId) => Asset.loadAsync(moduleId)));
  }
};

type ConfigurationLineItem = {
  id: string;
  anchorYRatio: number;
  text: string;
  note?: string;
};

export default function Index() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobileLayout = screenWidth < 768;
  const engravingReferenceHeight = isMobileLayout
    ? Math.max(180, Math.min(430, screenHeight - 430))
    : undefined;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState<PanelState>(null);
  const [cardSize, setCardSize] = useState<{ width: number; height: number } | null>(null);
  const [composition, setComposition] = useState<CompositionBead[]>(INITIAL_COMPOSITION);
  const [selectedBeadId, setSelectedBeadId] = useState<string | null>(null);
  const [personalizationMode, setPersonalizationMode] = useState<PersonalizationMode | null>(null);
  const [modeCardsExpanded, setModeCardsExpanded] = useState(false);
  const [engravingName, setEngravingName] = useState("");
  const [engravingPoliceId, setEngravingPoliceId] = useState("1");
  const [lettersName, setLettersName] = useState("");
  const [lettersAppliedName, setLettersAppliedName] = useState("");
  const [lettersValidationError, setLettersValidationError] = useState<string | null>(null);
  const [mobileNameEditorOpen, setMobileNameEditorOpen] = useState(false);
  const [engravingConfirmed, setEngravingConfirmed] = useState(false);
  const [showCelebrationCig, setShowCelebrationCig] = useState(false);
  const celebrationFade = useRef(new Animated.Value(0)).current;

  const clipModel = DEFAULT_CLIP_MODEL;
  const showEngravingControls =
    personalizationMode === "engraving" &&
    clipModel.material === "wood" &&
    !!clipModel.engravingArea &&
    (!isMobileLayout || mobileNameEditorOpen);
  const showLettersControls = personalizationMode === "letters" && (!isMobileLayout || mobileNameEditorOpen);
  const hideWorkspaceWhileEngravingEditor = isMobileLayout && showEngravingControls;
  const hasChosenPersonalization = personalizationMode !== null;

  const getBeadConsumedLengthPx = (bead: CompositionBead) => {
    const siliconeLentilleHeightMm =
      bead.family === PERLES_SILICONE_ID && bead.shape === "lentille"
        ? (bead.heightMm ?? 5)
        : bead.size;
    const anchorReductionMm = (bead.topAnchorOffsetMm ?? 0) + (bead.bottomAnchorOffsetMm ?? 0);
    const effectiveSizeMm = Math.max(0, siliconeLentilleHeightMm - anchorReductionMm);
    return effectiveSizeMm * MM;
  };

  const canReplaceWithinLengthLimit = (
    beads: CompositionBead[],
    beadId: string,
    nextSizeMm: number,
    nextTopAnchorOffsetMm?: number,
    nextBottomAnchorOffsetMm?: number,
  ) => {
    const currentBead = beads.find((b) => b.id === beadId);
    if (!currentBead) return false;

    const currentTotalPx = beads.reduce((sum, b) => sum + getBeadConsumedLengthPx(b), 0);
    const currentBeadPx = getBeadConsumedLengthPx(currentBead);
    const nextBeadPx = getBeadConsumedLengthPx({
      ...currentBead,
      size: nextSizeMm,
      topAnchorOffsetMm: nextTopAnchorOffsetMm,
      bottomAnchorOffsetMm: nextBottomAnchorOffsetMm,
    });

    const nextTotalPx = currentTotalPx - currentBeadPx + nextBeadPx;
    return nextTotalPx <= TEMPLATE_INNER_HEIGHT_PX;
  };

  const totalLengthPx = useMemo(
    () => composition.reduce((sum, b) => sum + getBeadConsumedLengthPx(b), 0),
    [composition],
  );
  const selectedBead = useMemo(
    () => composition.find((b) => b.id === selectedBeadId) ?? null,
    [composition, selectedBeadId],
  );
  const selectedBeadSizePx = selectedBead ? getBeadConsumedLengthPx(selectedBead) : 0;
  const formesInComposition = useMemo(
    () => composition.filter((bead) => bead.family === FORMES_ID),
    [composition],
  );
  const hasFormeInComposition = useMemo(
    () => formesInComposition.length > 0,
    [formesInComposition],
  );
  const existingLeafFormeCount = useMemo(
    () => formesInComposition.filter((bead) => LEAF_FORME_VARIANT_IDS.has(bead.variantId ?? "")).length,
    [formesInComposition],
  );
  const crochetCount = useMemo(
    () => composition.filter((bead) => bead.family === CROCHET_ID).length,
    [composition],
  );
  const remainingLengthPx = useMemo(
    () => Math.max(0, TEMPLATE_INNER_HEIGHT_PX - totalLengthPx),
    [totalLengthPx],
  );

  const isCreationComplete = composition.length > 0;

  const newBeadId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const buildGeneratedLetterBeads = (nameValue: string): CompositionBead[] => {
    const letters = normalizeNameToLetters(nameValue);
    return letters
      .map((letter) => getLettreVariantById(getLetterVariantIdFromChar(letter) ?? ""))
      .filter((variant): variant is NonNullable<typeof variant> => !!variant)
      .map((variant, index) => ({
        id: `generated-letter-slot-${index}`,
        family: LETTRES_ID,
        shape: variant.shape,
        material: "bois",
        variantId: variant.id,
        colorId: variant.id,
        size: variant.size,
        imageAspectRatio: variant.imageAspectRatio,
        hex: "#d1b48f",
        image: variant.image,
        label: variant.letter,
        generatedByName: true,
      }));
  };

  const canApplyLettersName = (baseComposition: CompositionBead[], nameValue: string) => {
    const generatedLetters = buildGeneratedLetterBeads(nameValue);
    const baseLengthPx = baseComposition.reduce((sum, bead) => sum + getBeadConsumedLengthPx(bead), 0);
    const lettersLengthPx = generatedLetters.reduce((sum, bead) => sum + getBeadConsumedLengthPx(bead), 0);
    return baseLengthPx + lettersLengthPx <= TEMPLATE_INNER_HEIGHT_PX;
  };

  const syncGeneratedLetters = (currentComposition: CompositionBead[], nameValue: string) => {
    const generatedLetters = buildGeneratedLetterBeads(nameValue);
    const firstGeneratedIndex = currentComposition.findIndex((bead) => bead.generatedByName);
    const insertionIndex = firstGeneratedIndex >= 0 ? firstGeneratedIndex : currentComposition.length;
    const withoutGenerated = currentComposition.filter((bead) => !bead.generatedByName);
    const safeIndex = Math.min(insertionIndex, withoutGenerated.length);
    return [
      ...withoutGenerated.slice(0, safeIndex),
      ...generatedLetters,
      ...withoutGenerated.slice(safeIndex),
    ];
  };

  useEffect(() => {
    if (personalizationMode !== "letters") {
      setComposition((prev) => prev.filter((bead) => !bead.generatedByName));
      return;
    }

    setComposition((prev) => {
      return syncGeneratedLetters(prev, lettersAppliedName);
    });
  }, [lettersAppliedName, personalizationMode]);

  useEffect(() => {
    if (!hasChosenPersonalization) return;
    setSelectedBeadId(null);
    setPanel(null);
    setSidebarOpen(false);
  }, [hasChosenPersonalization, personalizationMode]);

  useEffect(() => {
    if (personalizationMode !== "engraving") {
      setEngravingConfirmed(false);
    }
  }, [personalizationMode]);

  useEffect(() => {
    if (personalizationMode) {
      setModeCardsExpanded(false);
    }
  }, [personalizationMode]);

  useEffect(() => {
    if (!isMobileLayout) {
      setMobileNameEditorOpen(false);
    }
  }, [isMobileLayout]);

  useEffect(() => {
    setComposition((prev) => {
      let changed = false;
      const next = prev.map((bead) => {
        if (
          bead.family === PERLES_SILICONE_ID &&
          bead.shape === "lentille" &&
          (bead.size !== 5 || bead.widthMm !== 12 || bead.heightMm !== 5)
        ) {
          changed = true;
          return {
            ...bead,
            size: 5,
            widthMm: 12,
            heightMm: 5,
          };
        }
        return bead;
      });
      return changed ? next : prev;
    });
  }, [composition]);

  const hideCelebrationCig = () => {
    setShowCelebrationCig(false);
    celebrationFade.stopAnimation();
    celebrationFade.setValue(0);
  };

  const showCelebrationCigWithFade = () => {
    setShowCelebrationCig(true);
    celebrationFade.stopAnimation();
    celebrationFade.setValue(0);
    Animated.timing(celebrationFade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    let cancelled = false;

    const runWarmup = async () => {
      // Phase 1: assets visibles très tôt dans l'UI
      const criticalAssets = uniqueModuleAssets([
        clipModel.image,
        require("../assets/images/loop.png"),
        require("../assets/images/police ecriture.png"),
        require("../assets/images/cig1.png"),
        ...SILICONE_COLORS.map((color) => color.image),
        ...SILICONE_COLORS.map((color) => getSiliconeLentilleImageByColorId(color.id)),
        ...SILICONE_COLORS.map((color) => getSiliconeEtoileImageByColorId(color.id)),
        ...SILICONE_COLORS.map((color) => getSiliconeHexImageByColorId(color.id)),
        ...CROCHET_COLORS.map((color) => color.image ?? null),
        ...FORMES_VARIANTS.map((variant) => variant.image),
        ...WOOD_VARIANTS.map((variant) => variant.image ?? null),
        ...LETTRES_SPECIALES_VARIANTS.map((variant) => variant.image),
      ]);

      if (!cancelled) {
        await preloadModulesInBatches(criticalAssets);
      }

      // Phase 2: alphabets (utiles plus tard), en différé pour ne pas gêner le rendu initial
      const secondaryAssets = uniqueModuleAssets(LETTRES_VARIANTS.map((variant) => variant.image));
      if (!cancelled) {
        await preloadModulesInBatches(secondaryAssets);
      }
    };

    const timer = setTimeout(() => {
      void runWarmup();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [clipModel.image]);

  const handleFamilyOpen = (familyId: string) => {
    hideCelebrationCig();
    if (familyId === LETTRES_ID) return;
    if ([PERLES_SILICONE_ID, PERLES_BOIS_ID, CROCHET_ID, FORMES_ID, LETTRES_ID].includes(familyId)) {
      setSidebarOpen(false);

      if (selectedBeadId) {
        setPanel({ family: familyId, mode: "replace", beadId: selectedBeadId });
        return;
      }

      setPanel({ family: familyId, mode: "add" });
    }
  };

  // === Silicone ===
  const handleAddPerleSilicone = (colorId: string, variantId: string) => {
    hideCelebrationCig();
    const color = getColorById(colorId);
    const variant = getVariantById(variantId);
    if (!color || !variant) return;
    const image =
      variant.shape === "lentille"
        ? getSiliconeLentilleImageByColorId(color.id)
        : variant.id === "etoile-14"
          ? getSiliconeEtoileImageByColorId(color.id) ?? color.image
        : variant.shape === "hexagone"
          ? getSiliconeHexImageByColorId(color.id) ?? color.image
          : color.image;
    const hexDimensions = variant.shape === "hexagone" ? getSiliconeHexDimensionsByColorId(color.id, 14) : null;
    const lentilleDimensions = variant.shape === "lentille" ? { width: 12, height: 5 } : null;
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: PERLES_SILICONE_ID,
        shape: variant.shape,
        material: "silicone",
        variantId: variant.id,
        colorId: color.id,
        size: variant.size,
        widthMm: hexDimensions?.width ?? lentilleDimensions?.width,
        heightMm: hexDimensions?.height ?? lentilleDimensions?.height,
        hex: color.hex,
        image,
      },
    ]);
  };

  const handleReplacePerleSilicone = (colorId: string, variantId: string) => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    const color = getColorById(colorId);
    const variant = getVariantById(variantId);
    if (!color || !variant) return;
    const image =
      variant.shape === "lentille"
        ? getSiliconeLentilleImageByColorId(color.id)
        : variant.id === "etoile-14"
          ? getSiliconeEtoileImageByColorId(color.id) ?? color.image
        : variant.shape === "hexagone"
          ? getSiliconeHexImageByColorId(color.id) ?? color.image
          : color.image;
    const hexDimensions = variant.shape === "hexagone" ? getSiliconeHexDimensionsByColorId(color.id, 14) : null;
    const lentilleDimensions = variant.shape === "lentille" ? { width: 12, height: 5 } : null;
    setComposition((prev) =>
      canReplaceWithinLengthLimit(prev, selectedBeadId, variant.size)
        ? prev.map((b) =>
            b.id === selectedBeadId
              ? {
                  ...b,
                  family: PERLES_SILICONE_ID,
                  shape: variant.shape,
                  material: "silicone",
                  variantId: variant.id,
                  colorId: color.id,
                  size: variant.size,
                  topAnchorOffsetMm: undefined,
                  bottomAnchorOffsetMm: undefined,
                  imageAspectRatio: undefined,
                  widthMm: hexDimensions?.width ?? lentilleDimensions?.width,
                  heightMm: hexDimensions?.height ?? lentilleDimensions?.height,
                  hex: color.hex,
                  image,
                }
              : b,
          )
        : prev,
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  // === Bois ===
  const handleAddPerleBois = (variantId: string) => {
    hideCelebrationCig();
    const variant = getWoodVariantById(variantId);
    if (!variant) return;
    const wood = WOOD_COLORS[0];
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: PERLES_BOIS_ID,
        shape: variant.shape,
        material: "bois",
        variantId: variant.id,
        colorId: wood.id,
        size: variant.size,
        hex: wood.hex,
        image: variant.image,
      },
    ]);
  };

  const handleReplacePerleBois = (variantId: string) => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    const variant = getWoodVariantById(variantId);
    if (!variant) return;
    const wood = WOOD_COLORS[0];
    setComposition((prev) =>
      canReplaceWithinLengthLimit(prev, selectedBeadId, variant.size)
        ? prev.map((b) =>
            b.id === selectedBeadId
              ? {
                  ...b,
                  family: PERLES_BOIS_ID,
                  shape: variant.shape,
                  material: "bois",
                  variantId: variant.id,
                  colorId: wood.id,
                  size: variant.size,
                  topAnchorOffsetMm: undefined,
                  bottomAnchorOffsetMm: undefined,
                  imageAspectRatio: undefined,
                  hex: wood.hex,
                  image: variant.image,
                }
              : b,
          )
        : prev,
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  // === Formes ===
  const handleAddForme = (variantId: string) => {
    hideCelebrationCig();
    const variant = getFormeVariantById(variantId);
    if (!variant) return;
    const dims = getFormeDimensionsByVariantId(variant.id);
    setComposition((prev) => {
      const formeBeads = prev.filter((b) => b.family === FORMES_ID);
      const firstForme = formeBeads[0];
      const nonFormeBeads = prev.filter((b) => b.family !== FORMES_ID);
      const firstFormeIndex = prev.findIndex((b) => b.family === FORMES_ID);
      const insertionIndex = firstFormeIndex >= 0 ? firstFormeIndex : nonFormeBeads.length;
      const existingLeafFormes = formeBeads.filter((bead) => LEAF_FORME_VARIANT_IDS.has(bead.variantId ?? ""));
      const selectedIsLeaf = LEAF_FORME_VARIANT_IDS.has(variant.id);

      const createFormeBead = (id: string) => ({
        id,
        family: FORMES_ID,
        shape: variant.shape,
        material: "silicone" as const,
        variantId: variant.id,
        colorId: variant.id,
        size: variant.size,
        topAnchorOffsetMm: variant.topAnchorOffsetMm,
        bottomAnchorOffsetMm: variant.bottomAnchorOffsetMm,
        widthMm: dims?.width,
        heightMm: dims?.height,
        hex: "#d4a574",
        image: variant.image,
      });

      const allExistingAreLeaf = formeBeads.length > 0 && existingLeafFormes.length === formeBeads.length;

      let nextFormes: CompositionBead[];
      if (selectedIsLeaf) {
        if (formeBeads.length === 0) {
          nextFormes = [createFormeBead(newBeadId())];
        } else if (allExistingAreLeaf && existingLeafFormes.length < 2) {
          nextFormes = [...formeBeads, createFormeBead(newBeadId())];
        } else if (allExistingAreLeaf && existingLeafFormes.length >= 2) {
          nextFormes = [createFormeBead(formeBeads[0]?.id ?? newBeadId()), ...formeBeads.slice(1)];
        } else {
          nextFormes = [createFormeBead(firstForme?.id ?? newBeadId())];
        }
      } else {
        nextFormes = [createFormeBead(firstForme?.id ?? newBeadId())];
      }

      return [
        ...nonFormeBeads.slice(0, insertionIndex),
        ...nextFormes,
        ...nonFormeBeads.slice(insertionIndex),
      ];
    });
  };

  const handleReplaceForme = (variantId: string) => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    const variant = getFormeVariantById(variantId);
    if (!variant) return;
    const dims = getFormeDimensionsByVariantId(variant.id);
    setComposition((prev) =>
      canReplaceWithinLengthLimit(
        prev,
        selectedBeadId,
        variant.size,
        variant.topAnchorOffsetMm,
        variant.bottomAnchorOffsetMm,
      )
        ? prev.map((b) =>
            b.id === selectedBeadId
              ? {
                  ...b,
                  family: FORMES_ID,
                  shape: variant.shape,
                  material: "silicone",
                  variantId: variant.id,
                  colorId: variant.id,
                  size: variant.size,
                  topAnchorOffsetMm: variant.topAnchorOffsetMm,
                  bottomAnchorOffsetMm: variant.bottomAnchorOffsetMm,
                  imageAspectRatio: undefined,
                  widthMm: dims?.width,
                  heightMm: dims?.height,
                  hex: "#d4a574",
                  image: variant.image,
                }
              : b,
          )
        : prev,
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  // === Lettres ===
  const handleAddLettre = (variantId: string) => {
    hideCelebrationCig();
    const variant = getLettreVariantById(variantId);
    if (!variant) return;
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: LETTRES_ID,
        shape: variant.shape,
        material: "silicone",
        variantId: variant.id,
        colorId: variant.id,
        size: variant.size,
        imageAspectRatio: variant.imageAspectRatio,
        hex: variant.hex,
        image: variant.image,
        label: variant.letter,
      },
    ]);
  };

  const handleReplaceLettre = (variantId: string) => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    const variant = getLettreVariantById(variantId);
    if (!variant) return;
    setComposition((prev) =>
      prev.map((b) =>
        b.id === selectedBeadId
          ? {
              ...b,
              family: LETTRES_ID,
              shape: variant.shape,
              material: "silicone",
              variantId: variant.id,
              colorId: variant.id,
              size: variant.size,
              topAnchorOffsetMm: undefined,
              bottomAnchorOffsetMm: undefined,
              imageAspectRatio: variant.imageAspectRatio,
              hex: variant.hex,
              image: variant.image,
              label: variant.letter,
            }
          : b,
      ),
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  // === Crochet ===
  const handleAddCrochet = (colorId: string) => {
    hideCelebrationCig();
    const color = CROCHET_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    if (crochetCount >= MAX_CROCHET_BEADS) return;
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: CROCHET_ID,
        shape: "ronde",
        material: "crochet",
        variantId: CROCHET_VARIANT_ID,
        colorId: color.id,
        size: CROCHET_SIZE_MM,
        hex: color.hex,
        image: color.image,
      },
    ]);
  };

  const handleReplaceCrochet = (colorId: string) => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    const color = CROCHET_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    setComposition((prev) =>
      (() => {
        const selected = prev.find((b) => b.id === selectedBeadId);
        const currentCrochetCount = prev.filter((b) => b.family === CROCHET_ID).length;
        const replacingCrochet = selected?.family === CROCHET_ID;
        const canUseCrochet = replacingCrochet || currentCrochetCount < MAX_CROCHET_BEADS;
        if (!canUseCrochet) return prev;
        return canReplaceWithinLengthLimit(prev, selectedBeadId, CROCHET_SIZE_MM)
        ? prev.map((b) =>
            b.id === selectedBeadId
              ? {
                  ...b,
                  family: CROCHET_ID,
                  shape: "ronde",
                  material: "crochet",
                  variantId: CROCHET_VARIANT_ID,
                  colorId: color.id,
                  size: CROCHET_SIZE_MM,
                  topAnchorOffsetMm: undefined,
                  bottomAnchorOffsetMm: undefined,
                  imageAspectRatio: undefined,
                  hex: color.hex,
                  image: color.image,
                }
              : b,
          )
        : prev;
      })(),
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  const handleBeadTap = (beadId: string) => {
    hideCelebrationCig();
    setSelectedBeadId(beadId);
  };

  const handleDeleteSelectedBead = () => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    setComposition((prev) => prev.filter((b) => b.id !== selectedBeadId));
    setSelectedBeadId(null);
  };

  const handleDuplicateSelectedBead = () => {
    hideCelebrationCig();
    if (!selectedBead) return;
    if (selectedBead.family === FORMES_ID) return;
    if (selectedBead.family === CROCHET_ID && crochetCount >= MAX_CROCHET_BEADS) return;
    if (totalLengthPx + selectedBeadSizePx > TEMPLATE_INNER_HEIGHT_PX) return;

    const duplicatedBead: CompositionBead = {
      ...selectedBead,
      id: newBeadId(),
      generatedByName: false,
    };

    setComposition((prev) => {
      const index = prev.findIndex((bead) => bead.id === selectedBead.id);
      if (index < 0) return prev;
      const next = [...prev];
      next.splice(index + 1, 0, duplicatedBead);
      return next;
    });
    setSelectedBeadId(null);
    setPanel(null);
  };

  const moveSelectedBead = (direction: -1 | 1) => {
    hideCelebrationCig();
    if (!selectedBeadId) return;
    setComposition((prev) => {
      const index = prev.findIndex((b) => b.id === selectedBeadId);
      if (index < 0) return prev;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const handleReplaceRequest = () => {
    hideCelebrationCig();
    if (!selectedBead) return;
    if (selectedBead.generatedByName) return;
    if ([PERLES_SILICONE_ID, PERLES_BOIS_ID, CROCHET_ID, FORMES_ID, LETTRES_ID].includes(selectedBead.family)) {
      setPanel({ family: selectedBead.family, mode: "replace", beadId: selectedBead.id });
    }
  };

  const isReplaceMode = panel?.mode === "replace";
  const menuVisible = !!selectedBead && !panel;
  const canDuplicateSelectedBead = !!selectedBead && selectedBead.family !== FORMES_ID && (selectedBead.family !== CROCHET_ID || crochetCount < MAX_CROCHET_BEADS) && totalLengthPx + selectedBeadSizePx <= TEMPLATE_INNER_HEIGHT_PX;
  const showMobileActionBar =
    isMobileLayout &&
    !panel &&
    !showEngravingControls &&
    !showLettersControls;
  const showCreationCaptureBanner =
    isMobileLayout &&
    isCreationComplete &&
    !sidebarOpen &&
    !panel &&
    !selectedBeadId &&
    !showEngravingControls &&
    !showLettersControls;
  const canUseCrochetInCurrentContext = !isReplaceMode
    ? crochetCount < MAX_CROCHET_BEADS
    : (selectedBead?.family === CROCHET_ID) || crochetCount < MAX_CROCHET_BEADS;

  // Bead menu preview info
  const previewName = (() => {
    if (!selectedBead) return undefined;
    if (selectedBead.family === PERLES_BOIS_ID) return WOOD_COLORS[0].name;
    if (selectedBead.family === FORMES_ID) {
      return getFormeVariantById(selectedBead.variantId ?? "")?.label;
    }
    if (selectedBead.family === LETTRES_ID) {
      return getLettreVariantById(selectedBead.variantId ?? "")?.label;
    }
    if (selectedBead.family === CROCHET_ID) {
      const cc = CROCHET_COLORS.find((c) => c.id === selectedBead.colorId);
      return cc?.name;
    }
    const c = getColorById(selectedBead.colorId ?? "");
    return c?.name;
  })();

  const lettersRecapName = useMemo(() => {
    return composition
      .filter((bead) => bead.family === LETTRES_ID)
      .map((bead) => bead.label ?? "")
      .join("")
      .trim();
  }, [composition]);

  const configurationItems = useMemo<ConfigurationLineItem[]>(() => {
    const rawItems: ConfigurationLineItem[] = [];

    const clampRatio = (value: number) => Math.min(0.985, Math.max(0.015, value));
    const oneDecimalSize = (size: number) => (Number.isInteger(size) ? `${size}` : `${size}`.replace(".", ","));

    if (personalizationMode === "engraving" && engravingName.trim()) {
      rawItems.push({
        id: "engraving",
        anchorYRatio: clampRatio((CLIP_SIZE_PX * 0.42) / NATURAL_HEIGHT),
        text: `${engravingName.trim()} / n°${engravingPoliceId}`,
        note: "Le prénom est positionné par nos soins afin d'offrir le rendu le plus grand, harmonieux et lisible possible.",
      });
    }

    if (personalizationMode === "letters" && lettersRecapName) {
      rawItems.push({
        id: "letters",
        anchorYRatio: clampRatio((CLIP_SIZE_PX * 0.42) / NATURAL_HEIGHT),
        text: lettersRecapName,
      });
    }

    let cursorTopPx = TEMPLATE_TOP_PX;
    composition.forEach((bead) => {
      const siliconeColor = getColorById(bead.colorId ?? "");
      const formeVariant = getFormeVariantById(bead.variantId ?? "");
      const crochetColor = CROCHET_COLORS.find((color) => color.id === bead.colorId);
      const isLetter = bead.family === LETTRES_ID && !!bead.imageAspectRatio;

      const beadPx = bead.size * MM;
      const beadHeightPx = isLetter
        ? beadPx
        : bead.heightMm
          ? bead.heightMm * MM
          : bead.shape === "lentille"
            ? Math.round(beadPx + 3)
            : beadPx;
      const topAnchorOffsetPx = Math.max(0, (bead.topAnchorOffsetMm ?? 0) * MM);
      const bottomAnchorOffsetPx = Math.max(0, (bead.bottomAnchorOffsetMm ?? 0) * MM);
      const beadTopPx = cursorTopPx - BEAD_STACK_OVERLAP_PX - topAnchorOffsetPx;
      const beadCenterPx = beadTopPx + beadHeightPx / 2;

      cursorTopPx = beadTopPx + beadHeightPx - BEAD_STACK_OVERLAP_PX - bottomAnchorOffsetPx;

      const text =
        bead.family === FORMES_ID
          ? formeVariant?.label ?? bead.label ?? "Forme"
          : bead.family === PERLES_SILICONE_ID
            ? `SIL / ${oneDecimalSize(bead.size)} mm / ${siliconeColor?.name ?? "Couleur"}`
            : bead.family === PERLES_BOIS_ID
              ? `BOIS / ${oneDecimalSize(bead.size)} mm`
              : bead.family === CROCHET_ID
                ? `CRO / ${oneDecimalSize(bead.size)} mm / ${crochetColor?.name ?? "Couleur"}`
                : bead.family === LETTRES_ID
                  ? `BOIS / ${oneDecimalSize(bead.size)} mm`
                  : `${oneDecimalSize(bead.size)} mm`;

      rawItems.push({
        id: bead.id,
        anchorYRatio: clampRatio(beadCenterPx / NATURAL_HEIGHT),
        text,
      });
    });

    // Keep visual alignment while enforcing a minimum gap to avoid overlap.
    const minGapRatio = 0.018;
    const noteExtraGapRatio = 0.028;
    let previousRatio = 0;
    let previousHadNote = false;
    const adjusted = rawItems.map((item, index) => {
      const requiredGap = previousHadNote ? minGapRatio + noteExtraGapRatio : minGapRatio;
      const minRatio = index === 0 ? item.anchorYRatio : previousRatio + requiredGap;
      const nextRatio = clampRatio(Math.max(item.anchorYRatio, minRatio));
      previousRatio = nextRatio;
      previousHadNote = !!item.note;
      return {
        ...item,
        anchorYRatio: nextRatio,
      };
    });

    return adjusted;
  }, [composition, engravingName, engravingPoliceId, lettersRecapName, personalizationMode]);

  const handleSelectPersonalizationMode = (mode: PersonalizationMode) => {
    hideCelebrationCig();
    setPersonalizationMode(mode);

    if (isMobileLayout) {
      setModeCardsExpanded(false);
      setMobileNameEditorOpen(mode === "engraving" || mode === "letters");
    }
  };

  const handleFinalizeMobileNameInput = (value: string) => {
    if (!isMobileLayout) return;
    if (!value.trim()) return;
    setMobileNameEditorOpen(false);
    setModeCardsExpanded(false);
  };

  const handleValidateEngravingSelection = () => {
    if (!engravingName.trim()) return;
    Keyboard.dismiss();
    setEngravingConfirmed(true);
    setMobileNameEditorOpen(false);
    setModeCardsExpanded(false);
    showCelebrationCigWithFade();
  };

  const handleValidateLettersSelection = () => {
    if (!lettersName.trim()) return;

    const baseComposition = composition.filter((bead) => !bead.generatedByName);
    if (!canApplyLettersName(baseComposition, lettersName)) {
      setLettersValidationError(
        "Cette configuration dépasse la longueur maximale autorisée. Le prénom est trop long pour cette composition. Veuillez retirer quelques perles ou choisir un prénom plus court.",
      );
      return;
    }

    setLettersValidationError(null);
    setLettersAppliedName(lettersName);
    Keyboard.dismiss();
    setMobileNameEditorOpen(false);
    setModeCardsExpanded(false);
    showCelebrationCigWithFade();
  };

  const handleBackToPersonalizationChoices = () => {
    hideCelebrationCig();
    Keyboard.dismiss();
    setMobileNameEditorOpen(false);
    setModeCardsExpanded(true);
    setPersonalizationMode(null);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        <Header />

        {(!isMobileLayout || modeCardsExpanded) && (
          <View style={[styles.modePanel, isMobileLayout && styles.modePanelMobile]}>
            <Text style={styles.modeTitle}>Souhaitez-vous personnaliser votre attache-tétine avec un prénom ?</Text>
            {modeCardsExpanded ? (
              <View style={styles.modeCardsWrap}>
                {PERSONALIZATION_OPTIONS.map((option) => {
                  const selected = personalizationMode === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      testID={`personalization-mode-${option.id}`}
                      style={[styles.modeCard, selected && styles.modeCardSelected]}
                      onPress={() => handleSelectPersonalizationMode(option.id)}
                      hitSlop={8}
                      pressRetentionOffset={12}
                    >
                      <Image source={option.icon} style={styles.modeEmoji} resizeMode="contain" />
                      <Text style={[styles.modeCardTitle, selected && styles.modeCardTitleSelected]}>{option.title}</Text>
                      <Text style={styles.modeCardDescription}>{option.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              !isMobileLayout && (
                <View style={styles.modeCollapsedBar}>
                  <View style={styles.modeCollapsedTextWrap}>
                    <Text style={styles.modeCollapsedLabel}>Mode sélectionné</Text>
                    <Text style={styles.modeCollapsedValue}>
                      {PERSONALIZATION_OPTIONS.find((option) => option.id === personalizationMode)?.title ?? ""}
                    </Text>
                  </View>
                  <Pressable
                    testID="personalization-mode-change"
                    style={styles.modeCollapsedButton}
                    onPress={() => setModeCardsExpanded(true)}
                    hitSlop={8}
                    pressRetentionOffset={12}
                  >
                    <Text style={styles.modeCollapsedButtonText}>Changer</Text>
                  </Pressable>
                </View>
              )
            )}
          </View>
        )}

        {showEngravingControls && (
          <View style={styles.engravingPanel}>
            <View style={styles.engravingActionsRow}>
              <Pressable
                testID="engraving-back-button"
                style={styles.backToModeButton}
                onPress={handleBackToPersonalizationChoices}
                hitSlop={8}
                pressRetentionOffset={12}
              >
                <Ionicons name="arrow-back" size={16} color="#5a4b3c" />
                <Text style={styles.backToModeButtonText}>Retour</Text>
              </Pressable>

              <Pressable
                testID="engraving-validate-button"
                style={[
                  styles.topValidateButton,
                  !engravingName.trim() && styles.topValidateButtonDisabled,
                ]}
                onPress={handleValidateEngravingSelection}
                disabled={!engravingName.trim()}
                hitSlop={8}
                pressRetentionOffset={12}
              >
                <Text
                  style={[
                    styles.topValidateButtonText,
                    !engravingName.trim() && styles.topValidateButtonTextDisabled,
                  ]}
                >
                  Valider
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={!engravingName.trim() ? "#aa9b88" : "#5a4b3c"}
                />
              </Pressable>
            </View>

            <Text style={styles.engravingTitle}>Étape 1 : Choisissez une police d'écriture</Text>
            <View style={[styles.policeSelectorGrid, isMobileLayout && styles.policeSelectorGridMobile]} testID="engraving-police-grid">
              {Array.from({ length: 13 }, (_, index) => {
                const policeId = String(index + 1);
                const selected = engravingPoliceId === policeId;
                return (
                  <Pressable
                    key={policeId}
                    testID={`engraving-police-${policeId}`}
                    style={[styles.policeChip, isMobileLayout && styles.policeChipMobile, selected && styles.policeChipActive]}
                    onPress={() => {
                      setEngravingPoliceId(policeId);
                      if (engravingConfirmed) {
                        setEngravingConfirmed(false);
                      }
                    }}
                    hitSlop={8}
                    pressRetentionOffset={12}
                  >
                    <Text style={[styles.policeChipText, isMobileLayout && styles.policeChipTextMobile, selected && styles.policeChipTextActive]}>
                      {policeId}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.policeReferenceWrap, isMobileLayout && styles.policeReferenceWrapMobile]}>
              <Image
                source={require("../assets/images/police ecriture.png")}
                style={[
                  styles.policeReferenceImage,
                  isMobileLayout && styles.policeReferenceImageMobile,
                  isMobileLayout && engravingReferenceHeight ? { height: engravingReferenceHeight } : null,
                ]}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.engravingTitle, { marginTop: 12 }]}>Étape 2 : Saisissez le prénom</Text>
            <TextInput
              testID="engraving-name-input"
              style={styles.engravingInput}
              value={engravingName}
              onChangeText={(value) => {
                setEngravingName(value);
                if (engravingConfirmed) {
                  setEngravingConfirmed(false);
                }
              }}
              onSubmitEditing={(event) => handleFinalizeMobileNameInput(event.nativeEvent.text)}
              onEndEditing={(event) => handleFinalizeMobileNameInput(event.nativeEvent.text)}
              placeholder="Ex: Emma"
              placeholderTextColor="#b6a896"
              autoCorrect={false}
              autoCapitalize="words"
              maxLength={20}
            />
          </View>
        )}

        {showLettersControls && (
          <View style={styles.engravingPanel}>
            <View style={styles.engravingActionsRow}>
              <Pressable
                testID="letters-back-button"
                style={styles.backToModeButton}
                onPress={handleBackToPersonalizationChoices}
                hitSlop={8}
                pressRetentionOffset={12}
              >
                <Ionicons name="arrow-back" size={16} color="#5a4b3c" />
                <Text style={styles.backToModeButtonText}>Retour</Text>
              </Pressable>

              <Pressable
                testID="letters-validate-button"
                style={[
                  styles.topValidateButton,
                  !lettersName.trim() && styles.topValidateButtonDisabled,
                ]}
                onPress={handleValidateLettersSelection}
                disabled={!lettersName.trim()}
                hitSlop={8}
                pressRetentionOffset={12}
              >
                <Text
                  style={[
                    styles.topValidateButtonText,
                    !lettersName.trim() && styles.topValidateButtonTextDisabled,
                  ]}
                >
                  Valider
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={!lettersName.trim() ? "#aa9b88" : "#5a4b3c"}
                />
              </Pressable>
            </View>

            <Text style={styles.engravingTitle}>Prénom en lettres en bois</Text>
            <TextInput
              testID="letters-name-input"
              style={styles.engravingInput}
              value={lettersName}
              onChangeText={(value) => {
                setLettersName(value);
                if (lettersValidationError) {
                  setLettersValidationError(null);
                }
              }}
              onSubmitEditing={(event) => handleFinalizeMobileNameInput(event.nativeEvent.text)}
              onEndEditing={(event) => handleFinalizeMobileNameInput(event.nativeEvent.text)}
              placeholder="Ex: Charlotte"
              placeholderTextColor="#b6a896"
              autoCorrect={false}
              autoCapitalize="words"
              maxLength={20}
            />
            <Text style={styles.lettersHint}>
              Les lettres sont ajoutées après validation, dans la limite de longueur autorisée.
            </Text>
            {lettersValidationError ? (
              <View style={styles.lettersErrorBox}>
                <Text style={styles.lettersErrorText}>{lettersValidationError}</Text>
              </View>
            ) : null}
          </View>
        )}

        {!hideWorkspaceWhileEngravingEditor && (
          <View style={[styles.cardWrap, isMobileLayout && styles.cardWrapMobile]}>
            <View
              style={[styles.card, isMobileLayout && styles.cardMobile]}
              testID="workspace-card"
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setCardSize({ width, height });
              }}
            >
              {cardSize && (
                <View style={styles.workspaceScene}>
                  <View style={styles.workspaceVisualWrap}>
                    <Workspace
                      composition={composition}
                      availableWidth={Math.max(160, cardSize.width * 0.56)}
                      availableHeight={cardSize.height - (isMobileLayout ? 24 : 40)}
                      onBeadPress={handleBeadTap}
                      selectedBeadId={selectedBeadId}
                      clipModel={clipModel}
                      showEngravingPreview={personalizationMode === "engraving" && !!engravingName.trim()}
                      engravingPreviewText={engravingName.trim() ? "Votre prénom" : ""}
                    />
                  </View>

                  {showCelebrationCig ? (
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.workspaceCelebrationCig, { opacity: celebrationFade }]}
                      testID="workspace-cig1-celebration"
                    >
                      <Image
                        source={require("../assets/images/cig1.png")}
                        style={styles.workspaceCelebrationCigImage}
                        resizeMode="contain"
                      />
                    </Animated.View>
                  ) : null}

                  <View style={styles.workspaceLegendLayer} pointerEvents="none" testID="live-configuration-panel">
                    {configurationItems.length === 0 ? (
                      <Text style={styles.configurationEmpty}>Ajoutez des éléments pour voir le détail ici.</Text>
                    ) : (
                      configurationItems.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            styles.configurationBlock,
                            {
                              top: `${Math.round(item.anchorYRatio * 10000) / 100}%`,
                            },
                          ]}
                        >
                          <Text style={styles.configurationLine} numberOfLines={1} ellipsizeMode="tail">
                            {item.text}
                          </Text>
                          {item.note ? <Text style={styles.configurationNote}>{item.note}</Text> : null}
                        </View>
                      ))
                    )}
                  </View>

                </View>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>

      {showCreationCaptureBanner ? (
        <View style={styles.creationCaptureBanner} pointerEvents="none" testID="creation-capture-banner">
          <Text style={styles.creationCaptureBannerTitle}>✨ Création terminée ?</Text>
          <Text style={styles.creationCaptureBannerBody}>
            📸 Faites une capture d'écran de votre création, puis envoyez-la-moi afin que je puisse réaliser votre attache-tétine.
          </Text>
        </View>
      ) : null}

      {showMobileActionBar && (
        <View style={styles.mobileActionBar} pointerEvents="box-none">
          {composition.length === 0 ? (
            <View style={styles.mobileStartHintWrap} pointerEvents="none" testID="mobile-start-hint">
              <View style={styles.mobileStartHintCard}>
                <Text style={styles.mobileStartHintText}>
                  ✨ Pour commencer, choisissez une perle ou ajoutez un prénom grâce aux onglets ci-dessous.
                </Text>
              </View>
              <Ionicons name="arrow-down-circle-outline" size={20} color="#a3ba9e" />
            </View>
          ) : null}
          <View style={styles.mobileActionBarInner}>
            <Pressable
              style={styles.mobileActionBtn}
              onPress={() => {
                hideCelebrationCig();
                setSidebarOpen(true);
              }}
              testID="mobile-action-perles"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              pressRetentionOffset={12}
            >
              <Ionicons name="ellipse-outline" size={18} color="#5a4b3c" />
              <Text style={styles.mobileActionText}>Perles</Text>
            </Pressable>
            <Pressable
              style={styles.mobileActionBtn}
              onPress={() => {
                hideCelebrationCig();
                setModeCardsExpanded(true);
                if (personalizationMode === "engraving" || personalizationMode === "letters") {
                  setMobileNameEditorOpen(true);
                }
              }}
              testID="mobile-action-prenom"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              pressRetentionOffset={12}
            >
              <Ionicons name="text" size={18} color="#5a4b3c" />
              <Text style={styles.mobileActionText}>Prénom</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFamilyOpen={handleFamilyOpen}
        hiddenFamilyIds={[LETTRES_ID]}
        mobileMode={isMobileLayout}
      />

      <PerlesSiliconePanel
        visible={panel?.family === PERLES_SILICONE_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddPerleSilicone}
        onReplaceBead={handleReplacePerleSilicone}
      />

      <PerlesBoisPanel
        visible={panel?.family === PERLES_BOIS_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddPerleBois}
        onReplaceBead={handleReplacePerleBois}
      />

      <FormesPanel
        visible={panel?.family === FORMES_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        existingFormeCount={formesInComposition.length}
        existingLeafFormeCount={existingLeafFormeCount}
        hasExistingForme={hasFormeInComposition}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddForme}
        onReplaceBead={handleReplaceForme}
      />

      <LettresPanel
        visible={false}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddLettre}
        onReplaceBead={handleReplaceLettre}
      />

      <CrochetPanel
        visible={panel?.family === CROCHET_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        canUseCrochet={canUseCrochetInCurrentContext}
        maxCrochetCount={MAX_CROCHET_BEADS}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddCrochet}
        onReplaceBead={handleReplaceCrochet}
      />

      <BeadActionMenu
        visible={menuVisible}
        bead={
          selectedBead
            ? {
                name: previewName,
                size: selectedBead.size,
                shape: selectedBead.shape,
                material: selectedBead.material,
                image: selectedBead.image,
                hex: selectedBead.hex,
              }
            : null
        }
        onReplace={selectedBead?.family === LETTRES_ID ? undefined : handleReplaceRequest}
        onDuplicate={handleDuplicateSelectedBead}
        canDuplicate={canDuplicateSelectedBead}
        onDelete={handleDeleteSelectedBead}
        onMoveUp={selectedBead ? () => moveSelectedBead(-1) : undefined}
        onMoveDown={selectedBead ? () => moveSelectedBead(1) : undefined}
        onClose={() => setSelectedBeadId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff8f2" },
  safeArea: { flex: 1, backgroundColor: "#fff8f2" },
  modePanel: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  modePanelMobile: {
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5a4b3c",
    marginBottom: 8,
  },
  modeCardsWrap: {
    flexDirection: "row",
    gap: 6,
  },
  modeCollapsedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadfce",
    backgroundColor: "#fffdf9",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modeCollapsedTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  modeCollapsedLabel: {
    fontSize: 11,
    color: "#8b7a68",
    marginBottom: 2,
  },
  modeCollapsedValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  modeCollapsedButton: {
    borderRadius: 999,
    backgroundColor: "#f5efe4",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modeCollapsedButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  modeCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadfce",
    backgroundColor: "#fffdf9",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  modeCardSelected: {
    borderColor: "#b48a5c",
    backgroundColor: "#f9ecdc",
    shadowColor: "#8e6a3f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  modeEmoji: {
    width: 16,
    height: 16,
    marginBottom: 4,
  },
  modeCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6c5946",
    marginBottom: 3,
  },
  modeCardTitleSelected: {
    color: "#4d3926",
  },
  modeCardDescription: {
    fontSize: 10,
    lineHeight: 12,
    color: "#8b7a68",
  },
  engravingPanel: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1e8dc",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  engravingActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backToModeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f5efe4",
    marginBottom: 8,
  },
  backToModeButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  topValidateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f5efe4",
  },
  topValidateButtonDisabled: {
    backgroundColor: "#e3d8c8",
  },
  topValidateButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  topValidateButtonTextDisabled: {
    color: "#aa9b88",
  },
  engravingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5a4b3c",
    marginBottom: 8,
  },
  engravingInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ebdecd",
    backgroundColor: "#fff8f2",
    paddingHorizontal: 12,
    color: "#5a4b3c",
    fontSize: 16,
    fontWeight: "500",
  },
  policeReferenceWrap: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#fffaf4",
    borderWidth: 1,
    borderColor: "#efe1cf",
    padding: 6,
  },
  policeReferenceWrapMobile: {
    marginTop: 8,
    padding: 4,
    borderRadius: 14,
  },
  policeReferenceImage: {
    width: "100%",
    height: 300,
  },
  policeReferenceImageMobile: {
    height: 430,
  },
  policeSelectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  policeSelectorGridMobile: {
    flexWrap: "nowrap",
    marginTop: 6,
  },
  policeChip: {
    width: "13.8%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eadfce",
    backgroundColor: "#fffaf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  policeChipMobile: {
    width: "7%",
    minWidth: 22,
    maxWidth: 28,
    marginBottom: 0,
    borderRadius: 8,
  },
  policeChipActive: {
    borderColor: "#b48a5c",
    backgroundColor: "#f9ecdc",
  },
  policeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7d6a55",
  },
  policeChipTextMobile: {
    fontSize: 10,
  },
  policeChipTextActive: {
    color: "#5a4b3c",
  },
  lettersHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#8a7a67",
  },
  lettersErrorBox: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8c6c6",
    backgroundColor: "#fff4f4",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  lettersErrorText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#9b3f3f",
    fontWeight: "600",
  },
  cardWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  cardWrapMobile: {
    paddingBottom: 170,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    position: "relative",
  },
  cardMobile: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  workspaceScene: {
    flex: 1,
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  workspaceVisualWrap: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 4,
    zIndex: 1,
  },
  workspaceCelebrationCig: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "50%",
    height: "50%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 1,
  },
  workspaceCelebrationCigImage: {
    width: "100%",
    height: "100%",
    opacity: 0.92,
  },
  workspaceLegendLayer: {
    position: "absolute",
    right: 4,
    top: 0,
    bottom: 0,
    width: "48%",
    zIndex: 2,
  },
  configurationEmpty: {
    fontSize: 10,
    color: "#8a7a67",
    lineHeight: 14,
    marginTop: 18,
  },
  configurationBlock: {
    position: "absolute",
    left: -10,
    right: 0,
    transform: [{ translateY: -6 }],
  },
  configurationLine: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "600",
    color: "#6f5d4c",
  },
  configurationNote: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "400",
    color: "#9b9184",
  },
  mobileActionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    paddingHorizontal: 12,
  },
  mobileActionBarInner: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "#efe1cf",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  mobileStartHintWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  mobileStartHintCard: {
    maxWidth: 300,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d5e3d1",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 3,
  },
  mobileStartHintText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    color: "#6f7f6a",
    fontWeight: "500",
  },
  mobileActionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  mobileActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  creationCaptureBanner: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 116,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(213, 227, 209, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 40,
  },
  creationCaptureBannerTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: "#5a4b3c",
    marginBottom: 2,
  },
  creationCaptureBannerBody: {
    fontSize: 11,
    lineHeight: 15,
    color: "#7d6d5d",
    fontWeight: "500",
  },
});
