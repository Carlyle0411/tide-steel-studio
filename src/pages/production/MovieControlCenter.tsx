import { useMemo, useState } from "react";
import type { ProductionSection } from "./types";
import { productionAssets, productionDocs, storyboardShots } from "./data/productionData";
import { InspectorPanel, ProductionCard, ProductionShell, StatusPill } from "./components/ProductionShell";
import {
  AssetDatabaseView,
  CenterView,
  DashboardView,
  EpisodeManagerView,
  ExportCenterView,
  ImageCenterView,
  PromptCenterView,
  ReviewCenterView,
  SettingsView,
  StoryboardView,
  TextDocView,
  VideoCenterView
} from "./components/ProductionViews";
import { AIAssetLibraryView } from "./components/AIAssetLibraryView";
import { MCPControlView } from "./components/MCPControlView";
import { DirectorReviewView } from "./components/DirectorReviewView";
import { EP01ProductionBoardView } from "./components/EP01ProductionBoardView";
import { EditorReviewView } from "./components/EditorReviewView";
import { EpisodeFinalReviewView } from "./components/EpisodeFinalReviewView";
import { ProducerDashboardView } from "./components/ProducerDashboardView";
import { TimelineEditorView } from "./components/TimelineEditorView";
import { VisualReviewCenterView } from "./components/VisualReviewCenterView";
import { TideSteelStudioView } from "./components/TideSteelStudioView";
import { DirectorWorkstationView, GPTPromptLibraryView, KlingProductionCenterView, KlingPromptLibraryView, ReuseCenterView, ShotLibraryView } from "./components/DirectorWorkstationView";
import { AssetBibleView } from "./components/AssetBibleView";
import {
  AssetReferencePage,
  EntityLibraryPage,
  FinalPackagePage,
  IndustrialAssetLibraryPage,
  KeyframeProductionPage,
  ProductionLogPage,
  ProjectOverviewPage,
  PromptManagerPage,
  ScriptManagerPage,
  StoryboardDesignPage,
  TimelinePage,
  VideoPlanningPage,
  WorldBiblePage
} from "./components/DirectorStudioV2Views";
import { Phase19Inspector, Phase19ProductionShell } from "./components/Phase19ProductionShell";
import { Phase20MasterAssetLibraryView } from "./components/Phase20MasterAssetLibraryView";
import { EpisodeKeyframeLibraryView } from "./components/EpisodeKeyframeLibraryView";
import { Phase21ACharacterBibleView } from "./components/Phase21ACharacterBibleView";
import { Phase21BMechaCreatureBibleView } from "./components/Phase21BMechaCreatureBibleView";
import { Phase21CWorldAssetLibraryView } from "./components/Phase21CWorldAssetLibraryView";
import { Phase21DKlingVideoTemplateView } from "./components/Phase21DKlingVideoTemplateView";
import { WorldBibleEnhancedView } from "./components/WorldBibleEnhancedView";
import { ScriptWorkspaceView } from "./components/ScriptWorkspaceView";
import { StoryboardWorkspaceView } from "./components/StoryboardWorkspaceView";
import { CameraDesignWorkspaceView } from "./components/CameraDesignWorkspaceView";
import { KlingPromptWorkspaceView, VideoClipWorkspaceView, VideoVersionManagerView } from "./components/VideoProductionWorkspaceViews";
import { MasterVideoLibraryView } from "./components/MasterVideoLibraryView";
import {
  AudioLibraryView,
  FilmIntroductionView,
  PostFinalPackageView,
  SubtitleStudioView,
  TrailerEditorView,
  TransitionLibraryView,
  VideoMaterialLibraryView,
  VoiceStudioView
} from "./components/PostProductionSystemViews";
import {
  Phase19AssetReference,
  Phase19DirectorDashboard,
  Phase19EntityLibrary,
  Phase19FinalPackage,
  Phase19Keyframes,
  Phase19ProductionLog,
  Phase19ProjectOverview,
  Phase19PromptCenter,
  Phase19ScriptManager,
  Phase19ShotLibrary,
  Phase19Storyboard,
  Phase19Timeline,
  Phase19VideoPlanning,
  Phase19WorldBible
} from "./components/Phase19IndustrialViews";

export default function MovieControlCenter() {
  const [active, setActive] = useState<ProductionSection>("dashboard");
  const inspector = useMemo(() => <Phase19Inspector active={active} />, [active]);

  return (
    <Phase19ProductionShell active={active} onChange={setActive} inspector={inspector}>
      {renderSection(active, setActive)}
    </Phase19ProductionShell>
  );
}

function renderSection(active: ProductionSection, navigate: (section: ProductionSection) => void) {
  switch (active) {
    case "dashboard":
      return <Phase19DirectorDashboard navigate={navigate} />;
    case "assetBible":
      return <Phase20MasterAssetLibraryView />;
    case "masterVideoLibrary":
      return <MasterVideoLibraryView />;
    case "generationQueue":
      return <Phase20MasterAssetLibraryView />;
    case "tideSteelStudio":
      return <Phase19ProjectOverview navigate={navigate} />;
    case "reuseCenter":
      return <Phase19AssetReference />;
    case "shotLibrary":
      return <CameraDesignWorkspaceView />;
    case "gptPromptLibrary":
      return <Phase19PromptCenter />;
    case "klingPromptLibrary":
      return <KlingPromptWorkspaceView />;
    case "videoMaterials":
      return <VideoMaterialLibraryView />;
    case "trailerEditor":
      return <TrailerEditorView />;
    case "subtitleStudio":
      return <SubtitleStudioView />;
    case "voiceStudio":
      return <VoiceStudioView />;
    case "audioLibrary":
      return <AudioLibraryView />;
    case "transitionLibrary":
      return <TransitionLibraryView />;
    case "filmIntro":
      return <FilmIntroductionView />;
    case "postExport":
      return <PostFinalPackageView />;
    case "production":
      return <ProjectOverviewPage navigate={navigate} />;
    case "producerDashboard":
      return <ProducerDashboardView />;
    case "ep01Production":
      return <EP01ProductionBoardView />;
    case "ep01FinalReview":
      return <EpisodeFinalReviewView />;
    case "visualReview":
      return <VideoVersionManagerView />;
    case "aiAssetLibrary":
      return <AIAssetLibraryView />;
    case "mcp":
      return <MCPControlView />;
    case "directorReview":
      return <DirectorReviewView />;
    case "editorReview":
      return <EditorReviewView />;
    case "story":
      return <WorldBibleEnhancedView />;
    case "episode":
      return <ScriptWorkspaceView navigate={navigate} />;
    case "assets":
      return <Phase20MasterAssetLibraryView />;
    case "characters":
      return <Phase20MasterAssetLibraryView initialCategory="人物" />;
    case "creatures":
      return <Phase20MasterAssetLibraryView initialCategory="怪兽" />;
    case "mechas":
      return <Phase20MasterAssetLibraryView initialCategory="机甲" />;
    case "environment":
      return <Phase20MasterAssetLibraryView initialCategory="场景" />;
    case "props":
      return <Phase20MasterAssetLibraryView initialCategory="道具" />;
    case "storyboard":
      return <StoryboardWorkspaceView />;
    case "timeline":
      return <Phase19Timeline />;
    case "prompt":
      return <Phase19PromptCenter />;
    case "image":
      return <EpisodeKeyframeLibraryView />;
    case "video":
      return <VideoClipWorkspaceView />;
    case "review":
      return <Phase19ProductionLog />;
    case "export":
      return <Phase19FinalPackage />;
    case "settings":
      return <SettingsView />;
    default:
      return <DirectorWorkstationView />;
  }
}

function ProductionInspector({ active }: { active: ProductionSection }) {
  const approved = productionAssets.filter((item) => item.approved).length;
  const pending = productionAssets.length - approved;
  return (
    <InspectorPanel title={active === "dashboard" ? "导演状态" : active}>
      <ProductionCard className="p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">制作闸口</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between"><span>已通过资产</span><span className="text-jade">{approved}</span></div>
          <div className="flex items-center justify-between"><span>待审核资产</span><span className="text-gold">{pending}</span></div>
          <div className="flex items-center justify-between"><span>镜头数量</span><span>{storyboardShots.length}</span></div>
          <div className="flex items-center justify-between"><span>视频闸口</span><StatusPill status="锁定" /></div>
        </div>
      </ProductionCard>
      <ProductionCard className="p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">硬规则</div>
        <p className="mt-3 text-sm leading-6 text-slate-400">没有通过审核的图片禁止进入可灵视频阶段。所有镜头必须经过 Reference、生成、人工审核、资产库登记，再进入视频制作。</p>
      </ProductionCard>
      <ProductionCard className="p-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">下一步</div>
        <p className="mt-3 text-sm leading-6 text-slate-400">补齐许燃、陈牧、唐小满、AI澜资产；随后进入 EP01 第一批关键帧生成与审核。</p>
      </ProductionCard>
    </InspectorPanel>
  );
}
